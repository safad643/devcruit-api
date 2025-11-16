import { Collection, ObjectId } from 'mongodb';
import { IApplicationRepository, ApplicationListFilters, ApplicationListResult, ApplicationMetrics } from '../../../domain/repositories/IApplicationRepository';
import { Application, ApplicationProps, InterviewRound, StatusNotes } from '../../../domain/entities/Application';
import { getMongoDb } from './client';
import { InternalError, ForbiddenError } from '../../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class ApplicationRepository implements IApplicationRepository {
  private collection: Collection;

  constructor() {
    this.collection = getMongoDb().collection('applications');
  }

  async create(application: Omit<ApplicationProps, 'id' | 'appliedAt' | 'lastUpdatedAt' | 'status' | 'interviewRounds'> & {
    status?: string;
    interviewRounds?: InterviewRound[];
  }): Promise<Application> {
    try {
      const now = new Date();
      const result = await this.collection.insertOne({
        jobId: application.jobId,
        developerId: application.developerId,
        companyId: application.companyId,
        status: application.status || 'applied',
        shortlistMethod: application.shortlistMethod,
        statusNotes: application.statusNotes,
        rejectedAt: application.rejectedAt,
        rejectedAtStage: application.rejectedAtStage,
        interviewRounds: application.interviewRounds || [],
        appliedAt: now,
        lastUpdatedAt: now,
      });

      return this.mapToEntity({
        _id: result.insertedId,
        ...application,
        status: application.status || 'applied',
        interviewRounds: application.interviewRounds || [],
        appliedAt: now,
        lastUpdatedAt: now,
      });
    } catch (error) {
      throw new InternalError('Failed to create application', error as Error);
    }
  }

  async findById(id: string): Promise<Application | null> {
    try {
      if (!ObjectId.isValid(id)) return null;
      const doc = await this.collection.findOne({ _id: new ObjectId(id) });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findByJobId(jobId: string): Promise<Application[]> {
    try {
      const docs = await this.collection.find({ jobId }).toArray();
      return docs.map(doc => this.mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findByDeveloperId(developerId: string): Promise<Application[]> {
    try {
      const docs = await this.collection.find({ developerId }).toArray();
      return docs.map(doc => this.mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findByJobIdAndDeveloperId(jobId: string, developerId: string): Promise<Application | null> {
    try {
      const doc = await this.collection.findOne({ jobId, developerId });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async update(id: string, updates: Partial<ApplicationProps>): Promise<Application> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new InternalError('Invalid application ID format');
      }

      const { id: _id, appliedAt, lastUpdatedAt, ...updateFields } = updates;
      const updatePayload = {
        ...updateFields,
        lastUpdatedAt: new Date(),
      } as any;

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new InternalError('Application not found for update');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to update application', error as Error);
    }
  }

  async listWithFilters(filters: ApplicationListFilters): Promise<ApplicationListResult> {
    try {
      // Build match query
      const matchQuery: any = {};

      if (filters.companyId) {
        matchQuery.companyId = filters.companyId;
      }

      if (filters.developerId) {
        matchQuery.developerId = filters.developerId;
      }

      if (filters.jobId) {
        matchQuery.jobId = filters.jobId;
      }

      if (filters.status) {
        matchQuery.status = filters.status;
      }

      // Sorting (default: appliedAt desc)
      const sortField = filters.sortBy ?? 'appliedAt';
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

      // Get total count
      const total = await this.collection.countDocuments(matchQuery);

      // Apply pagination
      const skip = (filters.page - 1) * filters.limit;
      const docs = await this.collection
        .find(matchQuery)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(filters.limit)
        .toArray();

      const applications = docs.map(doc => this.mapToEntity(doc));

      return {
        applications,
        total,
      };
    } catch (error) {
      throw new InternalError('Failed to list applications with filters', error as Error);
    }
  }

  async getMetricsByJobId(jobId: string, companyId: string): Promise<ApplicationMetrics> {
    try {
      // First verify the job belongs to the company
      const job = await getMongoDb().collection('jobs').findOne({ 
        _id: new ObjectId(jobId),
        companyId: companyId 
      });

      if (!job) {
        throw new ForbiddenError('Job not found or you do not have access to it');
      }

      // Use aggregation to count applications by status
      const pipeline = [
        {
          $match: {
            jobId: jobId,
            companyId: companyId
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ];

      const results = await this.collection.aggregate(pipeline).toArray();

      // Initialize metrics with zeros
      const metrics: ApplicationMetrics = {
        total: 0,
        applied: 0,
        shortlisted: 0,
        interviewing: 0,
        rejected: 0,
        offer_extended: 0,
        offer_accepted: 0,
        offer_declined: 0,
        withdrawn: 0,
      };

      // Populate metrics from aggregation results
      results.forEach((result: any) => {
        const status = result._id;
        const count = result.count;
        metrics.total += count;
        
        if (status in metrics) {
          (metrics as any)[status] = count;
        }
      });

      return metrics;
    } catch (error) {
      if (error instanceof ForbiddenError) throw error;
      throw new InternalError('Failed to get application metrics', error as Error);
    }
  }

  private mapToEntity(doc: any): Application {
    // Helper to map interview rounds
    const mapInterviewRounds = (rounds: any[]): InterviewRound[] => {
      if (!Array.isArray(rounds)) return [];
      return rounds.map(round => ({
        roundName: round.roundName,
        status: round.status || 'pending',
        scheduledAt: round.scheduledAt ? (round.scheduledAt instanceof Date ? round.scheduledAt : new Date(round.scheduledAt)) : undefined,
        completedAt: round.completedAt ? (round.completedAt instanceof Date ? round.completedAt : new Date(round.completedAt)) : undefined,
        result: round.result,
        feedback: round.feedback,
        interviewerIds: round.interviewerIds || [],
      }));
    };

    // Migrate old fields to statusNotes for backward compatibility
    let statusNotes: StatusNotes | undefined = doc.statusNotes;
    
    // If statusNotes doesn't exist, create it from old fields
    if (!statusNotes && (doc.shortlistNote || doc.rejectionReason)) {
      statusNotes = {};
      if (doc.shortlistNote) {
        statusNotes.shortlisted = doc.shortlistNote;
      }
      if (doc.rejectionReason) {
        statusNotes.rejected = doc.rejectionReason;
      }
    }

    return new Application({
      id: doc._id.toString(),
      jobId: doc.jobId,
      developerId: doc.developerId,
      companyId: doc.companyId,
      status: doc.status || 'applied',
      shortlistMethod: doc.shortlistMethod,
      statusNotes,
      appliedAt: doc.appliedAt instanceof Date ? doc.appliedAt : new Date(doc.appliedAt),
      lastUpdatedAt: doc.lastUpdatedAt instanceof Date ? doc.lastUpdatedAt : new Date(doc.lastUpdatedAt),
      rejectedAt: doc.rejectedAt ? (doc.rejectedAt instanceof Date ? doc.rejectedAt : new Date(doc.rejectedAt)) : undefined,
      rejectedAtStage: doc.rejectedAtStage,
      interviewRounds: mapInterviewRounds(doc.interviewRounds || []),
    });
  }
}

