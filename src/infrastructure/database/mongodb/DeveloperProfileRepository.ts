import { Collection, ObjectId, WithId, Document, Filter } from 'mongodb';
import { IDeveloperProfileRepository, DeveloperListFilters, DeveloperListResult, CreateDeveloperProfileProps, UpdateDeveloperProfileProps, DeveloperProfileSearchFilters } from '../../../domain/repositories/IDeveloperProfileRepository';
import { DeveloperProfile } from '../../../domain/entities/DeveloperProfile';
import { getMongoDb } from './client';
import { InternalError, NotFoundError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { MongoGenericRepository } from './MongoGenericRepository';

@injectable()
export class DeveloperProfileRepository
  extends MongoGenericRepository<DeveloperProfile, CreateDeveloperProfileProps, UpdateDeveloperProfileProps>
  implements IDeveloperProfileRepository {

  protected _collection: Collection;

  constructor() {
    super();
    this._collection = getMongoDb().collection('developer_profiles');
  }

  protected _getEntityName(): string {
    return 'Developer profile';
  }

  protected _mapToEntity(doc: WithId<Document>): DeveloperProfile {
    return new DeveloperProfile({
      id: doc._id.toString(),
      userId: doc.userId,
      profilePhotoUrl: doc.profilePhotoUrl,
      bio: doc.bio,
      skills: doc.skills || [],
      techs: doc.techs || [],
      workHistory: doc.workHistory || [],
      employmentStatus: doc.employmentStatus,
      education: doc.education || [],
      certifications: doc.certifications || [],
      githubUrl: doc.githubUrl,
      portfolioUrl: doc.portfolioUrl,
      projects: doc.projects || [],
      linkedinUrl: doc.linkedinUrl,
      desiredSalary: doc.desiredSalary,
      jobTypePreferences: doc.jobTypePreferences || [],
      workArrangement: doc.workArrangement || [],
      yearsExperience: doc.yearsExperience,
      seniorityLevel: doc.seniorityLevel,
      willingToRelocate: doc.willingToRelocate,
      resumeUrl: doc.resumeUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(profile: CreateDeveloperProfileProps): Promise<DeveloperProfile> {
    try {
      const now = new Date();
      const result = await this._collection.insertOne({
        userId: profile.userId,
        profilePhotoUrl: profile.profilePhotoUrl,
        bio: profile.bio,
        skills: profile.skills,
        techs: profile.techs,
        workHistory: profile.workHistory,
        employmentStatus: profile.employmentStatus,
        education: profile.education,
        certifications: profile.certifications,
        githubUrl: profile.githubUrl,
        portfolioUrl: profile.portfolioUrl,
        projects: profile.projects,
        linkedinUrl: profile.linkedinUrl,
        desiredSalary: profile.desiredSalary,
        jobTypePreferences: profile.jobTypePreferences,
        workArrangement: profile.workArrangement,
        yearsExperience: profile.yearsExperience,
        seniorityLevel: profile.seniorityLevel,
        willingToRelocate: profile.willingToRelocate,
        resumeUrl: profile.resumeUrl,
        createdAt: now,
        updatedAt: now,
      });

      return new DeveloperProfile({
        id: result.insertedId.toString(),
        ...profile,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      throw new InternalError('Failed to create developer profile', error as Error);
    }
  }

  async update(id: string, updates: UpdateDeveloperProfileProps): Promise<DeveloperProfile> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new NotFoundError('Developer profile not found');
      }

      const { id: _id, userId, createdAt, updatedAt, ...updateFields } = updates;
      const updatePayload = { ...updateFields, updatedAt: new Date() };

      const result = await this._collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('Developer profile not found');
      }

      return this._mapToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalError('Failed to update developer profile', error as Error);
    }
  }

  async findByUserId(userId: string): Promise<DeveloperProfile | null> {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const doc = await this._collection.findOne({ userId });
      if (!doc) return null;
      return this._mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async search(filters: DeveloperProfileSearchFilters): Promise<DeveloperProfile[]> {
    try {
      const query: Filter<Document> = {};

      if (filters.techs && filters.techs.length > 0) {
        query.techs = { $in: filters.techs };
      }
      if (filters.seniorityLevel) {
        query.seniorityLevel = filters.seniorityLevel;
      }
      if (filters.willingToRelocate !== undefined) {
        query.willingToRelocate = filters.willingToRelocate;
      }
      if (filters.workArrangement && filters.workArrangement.length > 0) {
        query.workArrangement = { $in: filters.workArrangement };
      }
      if (filters.jobTypePreferences && filters.jobTypePreferences.length > 0) {
        query.jobTypePreferences = { $in: filters.jobTypePreferences };
      }
      if (filters.employmentStatus) {
        query.employmentStatus = filters.employmentStatus;
      }
      if (filters.minYearsExperience !== undefined || filters.maxYearsExperience !== undefined) {
        query.yearsExperience = {};
        if (filters.minYearsExperience !== undefined) {
          query.yearsExperience.$gte = filters.minYearsExperience;
        }
        if (filters.maxYearsExperience !== undefined) {
          query.yearsExperience.$lte = filters.maxYearsExperience;
        }
      }
      if (filters.minDesiredSalary !== undefined || filters.maxDesiredSalary !== undefined) {
        query.desiredSalary = {};
        if (filters.minDesiredSalary !== undefined) {
          query.desiredSalary.$gte = filters.minDesiredSalary;
        }
        if (filters.maxDesiredSalary !== undefined) {
          query.desiredSalary.$lte = filters.maxDesiredSalary;
        }
      }

      const docs = await this._collection.find(query).toArray();
      return docs.map(doc => this._mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async listWithFilters(filters: DeveloperListFilters): Promise<DeveloperListResult> {
    try {
      const pipeline: Document[] = [];

      pipeline.push({
        $addFields: {
          userIdObjectId: {
            $cond: {
              if: { $eq: [{ $type: '$userId' }, 'string'] },
              then: { $toObjectId: '$userId' },
              else: '$userId'
            }
          }
        }
      });

      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'userIdObjectId',
          foreignField: '_id',
          as: 'user'
        }
      });

      pipeline.push({
        $unwind: { path: '$user', preserveNullAndEmptyArrays: false }
      });

      pipeline.push({ $match: { 'user.role': 'developer' } });

      if (filters.isBlocked !== undefined) {
        pipeline.push({ $match: { 'user.isBlocked': filters.isBlocked } });
      }

      if (filters.search) {
        const searchRegex = { $regex: filters.search, $options: 'i' };
        pipeline.push({ $match: { 'user.email': searchRegex } });
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

      pipeline.push({
        $project: {
          _id: 1, userId: 1, profilePhotoUrl: 1, bio: 1, skills: 1, techs: 1,
          workHistory: 1, employmentStatus: 1, education: 1, certifications: 1,
          githubUrl: 1, portfolioUrl: 1, projects: 1, linkedinUrl: 1,
          desiredSalary: 1, jobTypePreferences: 1, workArrangement: 1,
          yearsExperience: 1, seniorityLevel: 1, willingToRelocate: 1,
          resumeUrl: 1, createdAt: 1, updatedAt: 1,
          userEmail: '$user.email', isBlocked: '$user.isBlocked'
        }
      });

      const docs = await this._collection.aggregate(pipeline).toArray();

      const developers = docs.map(doc => ({
        developerProfile: this._mapToEntity(doc as WithId<Document>),
        userEmail: doc.userEmail,
        isBlocked: doc.isBlocked
      }));

      return { developers, total };
    } catch (error) {
      throw new InternalError('Failed to list developers with filters', error as Error);
    }
  }
}
