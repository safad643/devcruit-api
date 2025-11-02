import { Collection, ObjectId } from 'mongodb';
import { ICompanyProfileRepository, CompanyListFilters, CompanyListResult } from '../../../domain/repositories/ICompanyProfileRepository';
import { CompanyProfile, CompanyProfileProps, DocumentReuploadRequest } from '../../../domain/entities/CompanyProfile';
import { getMongoDb } from './client';
import { InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { CompanyDocumentKey } from '../../../domain/types';

@injectable()
export class CompanyProfileRepository implements ICompanyProfileRepository {
  private collection: Collection;

  constructor() {
    this.collection = getMongoDb().collection('company_profiles');
  }

  async findByUserId(userId: string): Promise<CompanyProfile | null> {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const doc = await this.collection.findOne({ userId });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findById(id: string): Promise<CompanyProfile | null> {
    try {
      if (!ObjectId.isValid(id)) return null;
      const doc = await this.collection.findOne({ _id: new ObjectId(id) });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async create(
    profile: Omit<CompanyProfileProps, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'planHistory' | 'documentReuploadRequests'>
  ): Promise<CompanyProfile> {
    try {
      const now = new Date();
      const result = await this.collection.insertOne({
        userId: profile.userId,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        companyName: profile.companyName,
        companyWebsite: profile.companyWebsite,
        companySize: profile.companySize,
        businessRegistrationNumber: profile.businessRegistrationNumber,
        businessAddress: profile.businessAddress,
        businessRegistrationProofUrl: profile.businessRegistrationProofUrl,
        employmentVerificationUrl: profile.employmentVerificationUrl,
        status: 'pending',
        planHistory: [],
        documentReuploadRequests: [],
        createdAt: now,
        updatedAt: now,
      });

      await getMongoDb().collection('users').updateOne(
        { _id: new ObjectId(profile.userId) },
        { $set: { isProfileCompleted: true } }
      );

      return new CompanyProfile({
        id: result.insertedId.toString(),
        userId: profile.userId,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        companyName: profile.companyName,
        companyWebsite: profile.companyWebsite,
        companySize: profile.companySize,
        businessRegistrationNumber: profile.businessRegistrationNumber,
        businessAddress: profile.businessAddress,
        businessRegistrationProofUrl: profile.businessRegistrationProofUrl,
        employmentVerificationUrl: profile.employmentVerificationUrl,
        status: 'pending',
        planHistory: [],
        documentReuploadRequests: [],
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      throw new InternalError('Failed to create company profile', error as Error);
    }
  }

  async update(userId: string, updates: Partial<CompanyProfileProps>): Promise<CompanyProfile> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new InternalError('Invalid user ID format');
      }

      const { id, userId: _userId, createdAt, updatedAt, ...updateFields } = updates;
      const updatePayload = {
        ...updateFields,
        updatedAt: new Date(),
      } as any;

      const result = await this.collection.findOneAndUpdate(
        { userId },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new InternalError('Company profile not found for update');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to update company profile', error as Error);
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      const result = await this.collection.deleteOne({ userId });
      if (result.deletedCount === 0) {
        throw new InternalError('Company profile not found for deletion');
      }
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to delete company profile', error as Error);
    }
  }

  async listWithFilters(filters: CompanyListFilters): Promise<CompanyListResult> {
    try {
      // Build aggregation pipeline
      const pipeline: any[] = [];

      // Add initial filters that don't require user join
      const initialMatch: any = {};

      // Company size filter
      if (filters.companySize) {
        initialMatch.companySize = filters.companySize;
      }

      // Status filter
      if (filters.status) {
        initialMatch.status = filters.status;
      }

      if (Object.keys(initialMatch).length > 0) {
        pipeline.push({ $match: initialMatch });
      }

      // Lookup users to get email and isBlocked
      // Convert userId string to ObjectId for lookup
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
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false
        }
      });

      // Ensure we only get company role users
      pipeline.push({
        $match: {
          'user.role': 'company'
        }
      });

      // Blocked filter requires user data
      if (filters.isBlocked !== undefined) {
        pipeline.push({
          $match: {
            'user.isBlocked': filters.isBlocked
          }
        });
      }

      // Search filter (apply after join in case we need to search user fields)
      if (filters.search && filters.searchField) {
        const searchRegex = { $regex: filters.search, $options: 'i' };
        if (filters.searchField === 'email') {
          // Search in user.email field
          pipeline.push({
            $match: {
              'user.email': searchRegex
            }
          });
        } else {
          // Search in company profile fields
          pipeline.push({
            $match: {
              [filters.searchField]: searchRegex
            }
          });
        }
      }

      // Sorting (default: createdAt desc)
      const sortField = filters.sortBy ?? 'createdAt';
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

      // Get total count before pagination
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await this.collection.aggregate(countPipeline).toArray();
      const total = countResult.length > 0 ? countResult[0].total : 0;

      // Add pagination
      const skip = (filters.page - 1) * filters.limit;
      pipeline.push(
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: filters.limit }
      );

      // Project final fields
      pipeline.push({
        $project: {
          _id: 1,
          userId: 1,
          fullName: 1,
          phoneNumber: 1,
          companyName: 1,
          companyWebsite: 1,
          companySize: 1,
          businessRegistrationNumber: 1,
          businessAddress: 1,
          businessRegistrationProofUrl: 1,
          employmentVerificationUrl: 1,
          status: 1,
          planHistory: 1,
          documentReuploadRequests: 1,
          createdAt: 1,
          updatedAt: 1,
          userEmail: '$user.email',
          isBlocked: '$user.isBlocked'
        }
      });

      const docs = await this.collection.aggregate(pipeline).toArray();

      const companies = docs.map(doc => ({
        companyProfile: this.mapToEntity(doc),
        userEmail: doc.userEmail,
        isBlocked: doc.isBlocked
      }));

      return {
        companies,
        total
      };
    } catch (error) {
      throw new InternalError('Failed to list companies with filters', error as Error);
    }
  }

  async approveCompany(companyId: string): Promise<CompanyProfile> {
    try {
      if (!ObjectId.isValid(companyId)) {
        throw new InternalError('Invalid company ID format');
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(companyId) },
        { 
          $set: { 
            status: 'approved',
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new InternalError('Company profile not found');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to approve company profile', error as Error);
    }
  }

  async rejectCompany(companyId: string, documentReuploadRequest: DocumentReuploadRequest): Promise<CompanyProfile> {
    try {
      if (!ObjectId.isValid(companyId)) {
        throw new InternalError('Invalid company ID format');
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(companyId) },
        { 
          $set: { 
            status: 'rejected',
            updatedAt: new Date()
          },
          $push: {
            documentReuploadRequests: documentReuploadRequest
          }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new InternalError('Company profile not found');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to reject company profile', error as Error);
    }
  }

  async updateDocuments(userId: string, documents: Partial<Record<CompanyDocumentKey, string>>): Promise<CompanyProfile> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new InternalError('Invalid user ID format');
      }

      const updatePayload: any = {
        status: 'resubmitted',
        updatedAt: new Date()
      };

      // Map CompanyDocumentKey to actual field names
      if (documents.COMPANY_REGISTRATION_DOCUMENT) {
        updatePayload.businessRegistrationProofUrl = documents.COMPANY_REGISTRATION_DOCUMENT;
      }

      if (documents.COMPANY_VERIFICATION_DOCUMENT) {
        updatePayload.employmentVerificationUrl = documents.COMPANY_VERIFICATION_DOCUMENT;
      }

      const result = await this.collection.findOneAndUpdate(
        { userId },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new InternalError('Company profile not found for document update');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to update company documents', error as Error);
    }
  }

  private mapToEntity(doc: any): CompanyProfile {
    return new CompanyProfile({
      id: doc._id.toString(),
      userId: doc.userId,
      fullName: doc.fullName,
      phoneNumber: doc.phoneNumber,
      companyName: doc.companyName,
      companyWebsite: doc.companyWebsite,
      companySize: doc.companySize,
      businessRegistrationNumber: doc.businessRegistrationNumber,
      businessAddress: doc.businessAddress,
      businessRegistrationProofUrl: doc.businessRegistrationProofUrl,
      employmentVerificationUrl: doc.employmentVerificationUrl,
      status: doc.status ?? 'pending',
      planHistory: doc.planHistory ?? [],
      documentReuploadRequests: doc.documentReuploadRequests ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}


