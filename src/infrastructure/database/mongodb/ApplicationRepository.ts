import { Collection, ObjectId, WithId, Document, Filter } from 'mongodb';
import { IApplicationRepository, ApplicationListFilters, ApplicationListResult, ApplicationMetrics, CreateApplicationProps, UpdateApplicationProps } from '../../../domain/repositories/IApplicationRepository';
import { Application, ApplicationProps, InterviewRound, StatusNotes } from '../../../domain/entities/Application';
import { getMongoDb } from './client';
import { InternalError, ForbiddenError, NotFoundError, BadRequestError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { MongoGenericRepository } from './MongoGenericRepository';
import { toDate, toDateOptional, toArray } from './utils/mapperUtils';

@injectable()
export class ApplicationRepository
  extends MongoGenericRepository<Application, CreateApplicationProps, UpdateApplicationProps>
  implements IApplicationRepository {

  protected _collection: Collection;

  constructor() {
    super();
    this._collection = getMongoDb().collection('applications');
  }

  protected _getEntityName(): string {
    return 'Application';
  }

  protected _mapToEntity(doc: WithId<Document>): Application {
    const mapInterviewRounds = (rounds: InterviewRound[]): InterviewRound[] => {
      if (!Array.isArray(rounds)) return [];
      return rounds.map(round => ({
        roundName: round.roundName,
        status: round.status || 'pending',
        scheduledAt: toDateOptional(round.scheduledAt),
        completedAt: toDateOptional(round.completedAt),
        result: round.result,
        feedback: round.feedback,
        interviewerIds: toArray(round.interviewerIds),
        videoCallId: round.videoCallId,
        videoCallStatus: round.videoCallStatus,
        rescheduleRequest: round.rescheduleRequest,
        rescheduleHistory: round.rescheduleHistory,
      }));
    };

    let statusNotes: StatusNotes | undefined = doc.statusNotes;
    if (!statusNotes && (doc.shortlistNote || doc.rejectionReason)) {
      statusNotes = {};
      if (doc.shortlistNote) statusNotes.shortlisted = doc.shortlistNote;
      if (doc.rejectionReason) statusNotes.rejected = doc.rejectionReason;
    }

    return new Application({
      id: doc._id.toString(),
      jobId: doc.jobId,
      developerId: doc.developerId,
      companyId: doc.companyId,
      status: doc.status || 'applied',
      shortlistMethod: doc.shortlistMethod,
      statusNotes,
      appliedAt: toDate(doc.appliedAt),
      lastUpdatedAt: toDate(doc.lastUpdatedAt),
      rejectedAt: toDateOptional(doc.rejectedAt),
      rejectedAtStage: doc.rejectedAtStage,
      interviewRounds: mapInterviewRounds(toArray(doc.interviewRounds)),
      resumeUrl: doc.resumeUrl,
      currentOfferLetterId: doc.currentOfferLetterId,
    });
  }

  async create(application: CreateApplicationProps): Promise<Application> {
    try {
      const now = new Date();
      const docToInsert = {
        jobId: application.jobId,
        developerId: application.developerId,
        companyId: application.companyId,
        status: application.status || 'applied',
        shortlistMethod: application.shortlistMethod,
        statusNotes: application.statusNotes,
        rejectedAt: application.rejectedAt,
        rejectedAtStage: application.rejectedAtStage,
        interviewRounds: application.interviewRounds || [],
        resumeUrl: application.resumeUrl,
        appliedAt: now,
        lastUpdatedAt: now,
      };

      const result = await this._collection.insertOne(docToInsert);

      return this._mapToEntity({ _id: result.insertedId, ...docToInsert });
    } catch (error) {
      throw new InternalError('Failed to create application', error as Error);
    }
  }

  // Override needed: Application uses 'lastUpdatedAt' instead of 'updatedAt'
  // Also protects immutable field 'appliedAt' from accidental updates
  async update(id: string, updates: UpdateApplicationProps): Promise<Application> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid ID format');
      }

      const { id: _id, appliedAt, lastUpdatedAt, ...updateFields } = updates;
      const updatePayload = {
        ...updateFields,
        lastUpdatedAt: new Date(),
      };

      const result = await this._collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('Application not found');
      }

      return this._mapToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
      throw new InternalError('Failed to update application', error as Error);
    }
  }

  async findByJobId(jobId: string): Promise<Application[]> {
    try {
      const docs = await this._collection.find({ jobId }).toArray();
      return docs.map(doc => this._mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findByDeveloperId(developerId: string): Promise<Application[]> {
    try {
      const docs = await this._collection.find({ developerId }).toArray();
      return docs.map(doc => this._mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findByJobIdAndDeveloperId(jobId: string, developerId: string): Promise<Application | null> {
    try {
      const doc = await this._collection.findOne({ jobId, developerId });
      if (!doc) return null;
      return this._mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async listWithFilters(filters: ApplicationListFilters): Promise<ApplicationListResult> {
    try {
      const matchQuery: Filter<Document> = {};
      if (filters.companyId) matchQuery.companyId = filters.companyId;
      if (filters.developerId) matchQuery.developerId = filters.developerId;
      if (filters.jobId) matchQuery.jobId = filters.jobId;
      if (filters.status) matchQuery.status = filters.status;

      const sortField = filters.sortBy ?? 'appliedAt';
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

      const total = await this._collection.countDocuments(matchQuery);

      const skip = (filters.page - 1) * filters.limit;
      const docs = await this._collection
        .find(matchQuery)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(filters.limit)
        .toArray();

      const applications = docs.map(doc => this._mapToEntity(doc));

      return { applications, total };
    } catch (error) {
      throw new InternalError('Failed to list applications with filters', error as Error);
    }
  }

  async getMetricsByJobId(jobId: string, companyId: string): Promise<ApplicationMetrics> {
    try {
      const job = await getMongoDb().collection('jobs').findOne({
        _id: new ObjectId(jobId),
        companyId: companyId
      });

      if (!job) {
        throw new ForbiddenError('Job not found or you do not have access to it');
      }

      const pipeline = [
        { $match: { jobId: jobId, companyId: companyId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ];

      const results = await this._collection.aggregate(pipeline).toArray();

      const metrics: ApplicationMetrics = {
        total: 0, applied: 0, shortlisted: 0, interviewing: 0, rejected: 0,
        offer_extended: 0, offer_accepted: 0, offer_declined: 0, withdrawn: 0,
      };

      results.forEach((result) => {
        const status = result._id;
        const count = result.count;
        metrics.total += count;
        if (status in metrics) (metrics as unknown as Record<string, number>)[status] = count;
      });

      return metrics;
    } catch (error) {
      if (error instanceof ForbiddenError) throw error;
      throw new InternalError('Failed to get application metrics', error as Error);
    }
  }

  async findByInterviewerId(interviewerId: string): Promise<Application[]> {
    try {
      const docs = await this._collection.find({
        'interviewRounds.interviewerIds': interviewerId
      }).toArray();
      return docs.map(doc => this._mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findConflictingInterviews(interviewerId: string, scheduledAt: Date): Promise<Application[]> {
    try {
      const oneHourBefore = new Date(scheduledAt.getTime() - 60 * 60 * 1000);
      const oneHourAfter = new Date(scheduledAt.getTime() + 60 * 60 * 1000);

      const docs = await this._collection.find({
        'interviewRounds': {
          $elemMatch: {
            'interviewerIds': interviewerId,
            'status': 'scheduled',
            'scheduledAt': { $gte: oneHourBefore, $lte: oneHourAfter }
          }
        }
      }).toArray();

      return docs.map(doc => this._mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Failed to check for conflicting interviews', error as Error);
    }
  }
}
