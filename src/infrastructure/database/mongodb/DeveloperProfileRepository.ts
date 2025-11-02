import { Collection, ObjectId } from 'mongodb';
import { IDeveloperProfileRepository } from '../../../domain/repositories';
import { DeveloperProfile, DeveloperProfileProps } from '../../../domain/entities/DeveloperProfile';
import { getMongoDb } from './client';
import { InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class DeveloperProfileRepository implements IDeveloperProfileRepository {
  private collection: Collection;

  constructor() {
    this.collection = getMongoDb().collection('developer_profiles');
    
  }

  async findByUserId(userId: string): Promise<DeveloperProfile | null> {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const doc = await this.collection.findOne({ userId });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findById(id: string): Promise<DeveloperProfile | null> {
    try {
      if (!ObjectId.isValid(id)) return null;
      const doc = await this.collection.findOne({ _id: new ObjectId(id) });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async create(profile: Omit<DeveloperProfileProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeveloperProfile> {
    try {
      const now = new Date();
      const result = await this.collection.insertOne({
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

      await getMongoDb().collection('users').updateOne(
        { _id: new ObjectId(profile.userId) },
        { $set: { isProfileCompleted: true } }
      );

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

  async update(userId: string, updates: Partial<DeveloperProfileProps>): Promise<DeveloperProfile> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new InternalError('Invalid user ID format');
      }

      // Remove fields that shouldn't be updated
      const { id, userId: _userId, createdAt, updatedAt, ...updateFields } = updates;
      const updatePayload = {
        ...updateFields,
        updatedAt: new Date(),
      };

      const result = await this.collection.findOneAndUpdate(
        { userId },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new InternalError('Profile not found for update');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to update developer profile', error as Error);
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      const result = await this.collection.deleteOne({ userId });
      if (result.deletedCount === 0) {
        throw new InternalError('Profile not found for deletion');
      }
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to delete developer profile', error as Error);
    }
  }

  async search(filters: any): Promise<DeveloperProfile[]> {
    try {
      const query: any = {};
      
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
      
      const docs = await this.collection.find(query).toArray();
      return docs.map(doc => this.mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  private mapToEntity(doc: any): DeveloperProfile {
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
}

