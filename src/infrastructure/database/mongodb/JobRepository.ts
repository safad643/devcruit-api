import { Collection, ObjectId } from 'mongodb';
import { IJobRepository, JobListFilters, JobListResult, PublicJobListFilters } from '../../../domain/repositories/IJobRepository';
import { Job, JobProps, JobStatus } from '../../../domain/entities/Job';
import { getMongoDb } from './client';
import { InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class JobRepository implements IJobRepository {
  private collection: Collection;

  constructor() {
    this.collection = getMongoDb().collection('jobs');
  }

  async create(job: Omit<JobProps, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: JobStatus }): Promise<Job> {
    try {
      const now = new Date();
      const result = await this.collection.insertOne({
        companyId: job.companyId,
        title: job.title,
        description: job.description,
        category: job.category,
        requiredTech: job.requiredTech,
        requiredSkills: job.requiredSkills,
        experienceLevel: job.experienceLevel,
        minYears: job.minYears,
        niceTech: job.niceTech,
        niceSkills: job.niceSkills,
        jobType: job.jobType,
        workArrangement: job.workArrangement,
        location: job.location,
        relocation: job.relocation,
        compensation: job.compensation,
        benefits: job.benefits,
        validUntil: job.validUntil,
        autoShortlist: job.autoShortlist,
        status: job.status || 'draft',
        createdAt: now,
        updatedAt: now,
      });

      return this.mapToEntity({
        _id: result.insertedId,
        ...job,
        status: job.status || 'draft',
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      throw new InternalError('Failed to create job', error as Error);
    }
  }

  async findById(id: string): Promise<Job | null> {
    try {
      if (!ObjectId.isValid(id)) return null;
      const doc = await this.collection.findOne({ _id: new ObjectId(id) });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findByCompanyId(companyId: string): Promise<Job[]> {
    try {
      const docs = await this.collection.find({ companyId }).toArray();
      return docs.map(doc => this.mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async update(id: string, updates: Partial<JobProps>): Promise<Job> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new InternalError('Invalid job ID format');
      }

      const { id: _id, createdAt, updatedAt, ...updateFields } = updates;
      const updatePayload = {
        ...updateFields,
        updatedAt: new Date(),
      } as any;

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new InternalError('Job not found for update');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to update job', error as Error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new InternalError('Invalid job ID format');
      }
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        throw new InternalError('Job not found for deletion');
      }
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to delete job', error as Error);
    }
  }

  async listWithFilters(filters: JobListFilters): Promise<JobListResult> {
    try {
      // Build match query
      const matchQuery: any = {
        companyId: filters.companyId,
      };

      // Status filter
      if (filters.status) {
        matchQuery.status = filters.status;
      }

      // Search by title
      if (filters.search) {
        matchQuery.title = { $regex: filters.search, $options: 'i' };
      }

      // Sorting (default: createdAt desc)
      const sortField = filters.sortBy ?? 'createdAt';
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

      const jobs = docs.map(doc => this.mapToEntity(doc));

      return {
        jobs,
        total,
      };
    } catch (error) {
      throw new InternalError('Failed to list jobs with filters', error as Error);
    }
  }

  async listPublicWithFilters(filters: PublicJobListFilters): Promise<JobListResult> {
    try {
      // Only open jobs are visible publicly
      const matchQuery: any = {
        status: 'open',
      };
      if (filters.location) {
        matchQuery.location = { $regex: filters.location, $options: 'i' };
      }
      if (filters.jobType) {
        matchQuery.jobType = filters.jobType;
      }
      if (filters.workArrangement) {
        matchQuery.workArrangement = filters.workArrangement;
      }
      if (filters.experienceLevel) {
        matchQuery.experienceLevel = filters.experienceLevel;
      }
      // Free-text search across multiple fields
      if (filters.query) {
        const regex = { $regex: filters.query, $options: 'i' };
        matchQuery.$or = [
          { title: regex },
          { category: regex },
          { requiredTech: regex },
          { requiredSkills: regex },
        ];
      }

      // If company filter is provided, we need to join company_profiles to match by companyName
      const pipeline: any[] = [{ $match: matchQuery }];

      // Join company_profiles to enrich with company info and allow company name filtering
      pipeline.push({
        $lookup: {
          from: 'company_profiles',
          localField: 'companyId',
          foreignField: 'userId',
          as: 'companyProfile'
        }
      });
      pipeline.push({ $unwind: { path: '$companyProfile', preserveNullAndEmptyArrays: true } });

      if (filters.company) {
        pipeline.push({
          $match: {
            'companyProfile.companyName': { $regex: filters.company, $options: 'i' }
          }
        });
      }

      const sortField = filters.sortBy ?? 'createdAt';
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

      // Count total
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await this.collection.aggregate(countPipeline).toArray();
      const total = countResult.length > 0 ? countResult[0].total : 0;

      const skip = (filters.page - 1) * filters.limit;
      pipeline.push(
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: filters.limit }
      );

      const docs = await this.collection.aggregate(pipeline).toArray();
      const jobs = docs.map((doc: any) => this.mapToEntity(doc));

      return { jobs, total };
    } catch (error) {
      throw new InternalError('Failed to list public jobs with filters', error as Error);
    }
  }

  private mapToEntity(doc: any): Job {
    return new Job({
      id: doc._id.toString(),
      companyId: doc.companyId,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      requiredTech: doc.requiredTech ?? [],
      requiredSkills: doc.requiredSkills ?? [],
      experienceLevel: doc.experienceLevel,
      minYears: doc.minYears,
      niceTech: doc.niceTech ?? [],
      niceSkills: doc.niceSkills ?? [],
      jobType: doc.jobType,
      workArrangement: doc.workArrangement,
      location: doc.location,
      relocation: doc.relocation ?? false,
      compensation: doc.compensation,
      benefits: doc.benefits,
      validUntil: doc.validUntil instanceof Date ? doc.validUntil : new Date(doc.validUntil),
      autoShortlist: doc.autoShortlist ?? false,
      status: doc.status ?? 'draft',
      createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt),
    });
  }
}

