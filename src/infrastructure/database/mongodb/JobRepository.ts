import { Collection, ObjectId, WithId, Document, Filter } from 'mongodb';
import { IJobRepository, JobListFilters, JobListResult, PublicJobListFilters, CreateJobProps, UpdateJobProps } from '../../../domain/repositories/IJobRepository';
import { Job, JobProps } from '../../../domain/entities/Job';
import { getMongoDb } from './client';
import { InternalError, NotFoundError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { MongoGenericRepository } from './MongoGenericRepository';
import { toDate, toArray } from './utils/mapperUtils';

@injectable()
export class JobRepository
  extends MongoGenericRepository<Job, CreateJobProps, UpdateJobProps>
  implements IJobRepository {

  protected _collection: Collection;

  constructor() {
    super();
    this._collection = getMongoDb().collection('jobs');
  }

  protected _getEntityName(): string {
    return 'Job';
  }

  protected _mapToEntity(doc: WithId<Document>): Job {
    return new Job({
      id: doc._id.toString(),
      companyId: doc.companyId,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      requiredTech: toArray(doc.requiredTech),
      requiredSkills: toArray(doc.requiredSkills),
      interviewRounds: toArray(doc.interviewRounds),
      experienceLevel: doc.experienceLevel,
      minYears: doc.minYears,
      niceTech: toArray(doc.niceTech),
      niceSkills: toArray(doc.niceSkills),
      jobType: doc.jobType,
      workArrangement: doc.workArrangement,
      location: doc.location,
      relocation: doc.relocation ?? false,
      compensation: doc.compensation,
      benefits: doc.benefits,
      validUntil: toDate(doc.validUntil),
      autoShortlist: doc.autoShortlist ?? false,
      status: doc.status ?? 'draft',
      createdAt: toDate(doc.createdAt),
      updatedAt: toDate(doc.updatedAt),
    });
  }

  async create(job: CreateJobProps): Promise<Job> {
    try {
      const now = new Date();
      const result = await this._collection.insertOne({
        companyId: job.companyId,
        title: job.title,
        description: job.description,
        category: job.category,
        requiredTech: job.requiredTech,
        requiredSkills: job.requiredSkills,
        interviewRounds: job.interviewRounds,
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

      return this._mapToEntity({
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

  async update(id: string, updates: UpdateJobProps): Promise<Job> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new NotFoundError('Job not found');
      }

      const { id: _id, createdAt, updatedAt, ...updateFields } = updates;
      const updatePayload = {
        ...updateFields,
        updatedAt: new Date(),
      };

      const result = await this._collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('Job not found');
      }

      return this._mapToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalError('Failed to update job', error as Error);
    }
  }

  async findByCompanyId(companyId: string): Promise<Job[]> {
    try {
      const docs = await this._collection.find({ companyId }).toArray();
      return docs.map(doc => this._mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async listWithFilters(filters: JobListFilters): Promise<JobListResult> {
    try {
      const matchQuery: Filter<Document> = {
        companyId: filters.companyId,
      };

      if (filters.status) {
        matchQuery.status = filters.status;
      }

      if (filters.search) {
        matchQuery.title = { $regex: filters.search, $options: 'i' };
      }

      const sortField = filters.sortBy ?? 'createdAt';
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

      const total = await this._collection.countDocuments(matchQuery);

      const skip = (filters.page - 1) * filters.limit;
      const docs = await this._collection
        .find(matchQuery)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(filters.limit)
        .toArray();

      const jobs = docs.map(doc => this._mapToEntity(doc));

      return { jobs, total };
    } catch (error) {
      throw new InternalError('Failed to list jobs with filters', error as Error);
    }
  }

  async listPublicWithFilters(filters: PublicJobListFilters): Promise<JobListResult> {
    try {
      const matchQuery: Filter<Document> = {
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
      if (filters.query) {
        const regex = { $regex: filters.query, $options: 'i' };
        matchQuery.$or = [
          { title: regex },
          { category: regex },
          { requiredTech: regex },
          { requiredSkills: regex },
        ];
      }

      const pipeline: Document[] = [{ $match: matchQuery }];

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

      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await this._collection.aggregate(countPipeline).toArray();
      const total = countResult.length > 0 ? countResult[0].total : 0;

      const skip = (filters.page - 1) * filters.limit;
      pipeline.push(
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: filters.limit }
      );

      const docs = await this._collection.aggregate(pipeline).toArray();
      const jobs = docs.map((doc) => this._mapToEntity(doc as WithId<Document>));

      return { jobs, total };
    } catch (error) {
      throw new InternalError('Failed to list public jobs with filters', error as Error);
    }
  }

  async countActiveByCompany(companyId: string): Promise<number> {
    try {
      return await this._collection.countDocuments({
        companyId,
        status: 'open',
      });
    } catch (error) {
      throw new InternalError('Failed to count active jobs', error as Error);
    }
  }
}
