import { Collection, ObjectId, WithId, Document, Filter } from 'mongodb';
import { ICompanyProfileRepository, CompanyListFilters, CompanyListResult, CreateCompanyProfileProps, UpdateCompanyProfileProps } from '../../../domain/repositories/ICompanyProfileRepository';
import { CompanyProfile, CompanyProfileProps } from '../../../domain/entities/CompanyProfile';
import { getMongoDb } from './client';
import { InternalError, NotFoundError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { MongoGenericRepository } from './MongoGenericRepository';

@injectable()
export class CompanyProfileRepository
  extends MongoGenericRepository<CompanyProfile, CreateCompanyProfileProps, UpdateCompanyProfileProps>
  implements ICompanyProfileRepository {

  protected collection: Collection;

  constructor() {
    super();
    this.collection = getMongoDb().collection('company_profiles');
  }

  protected getEntityName(): string {
    return 'Company profile';
  }

  protected mapToEntity(doc: WithId<Document>): CompanyProfile {
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
      logoUrl: doc.logoUrl,
      status: doc.status ?? 'pending',
      planHistory: doc.planHistory ?? [],
      documentReuploadRequests: doc.documentReuploadRequests ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(profile: CreateCompanyProfileProps): Promise<CompanyProfile> {
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
        logoUrl: profile.logoUrl,
        status: 'pending',
        planHistory: [],
        documentReuploadRequests: [],
        createdAt: now,
        updatedAt: now,
      });

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
        logoUrl: profile.logoUrl,
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

  async update(id: string, updates: UpdateCompanyProfileProps): Promise<CompanyProfile> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new NotFoundError('Company profile not found');
      }

      const { id: _id, userId, createdAt, updatedAt, ...updateFields } = updates;
      const updatePayload = { ...updateFields, updatedAt: new Date() };

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('Company profile not found');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalError('Failed to update company profile', error as Error);
    }
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

  async listWithFilters(filters: CompanyListFilters): Promise<CompanyListResult> {
    try {
      const pipeline: Document[] = [];
      const initialMatch: Filter<Document> = {};

      if (filters.companySize) {
        initialMatch.companySize = filters.companySize;
      }
      if (filters.status) {
        initialMatch.status = filters.status;
      }
      if (Object.keys(initialMatch).length > 0) {
        pipeline.push({ $match: initialMatch });
      }

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

      pipeline.push({ $match: { 'user.role': 'company' } });

      if (filters.isBlocked !== undefined) {
        pipeline.push({ $match: { 'user.isBlocked': filters.isBlocked } });
      }

      if (filters.search && filters.searchField) {
        const searchRegex = { $regex: filters.search, $options: 'i' };
        if (filters.searchField === 'email') {
          pipeline.push({ $match: { 'user.email': searchRegex } });
        } else {
          pipeline.push({ $match: { [filters.searchField]: searchRegex } });
        }
      }

      const sortField = filters.sortBy ?? 'createdAt';
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await this.collection.aggregate(countPipeline).toArray();
      const total = countResult.length > 0 ? countResult[0].total : 0;

      const skip = (filters.page - 1) * filters.limit;
      pipeline.push(
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: filters.limit }
      );

      pipeline.push({
        $project: {
          _id: 1, userId: 1, fullName: 1, phoneNumber: 1, companyName: 1,
          companyWebsite: 1, companySize: 1, businessRegistrationNumber: 1,
          businessAddress: 1, businessRegistrationProofUrl: 1,
          employmentVerificationUrl: 1, logoUrl: 1, status: 1, planHistory: 1,
          documentReuploadRequests: 1, createdAt: 1, updatedAt: 1,
          userEmail: '$user.email', isBlocked: '$user.isBlocked'
        }
      });

      const docs = await this.collection.aggregate(pipeline).toArray();

      const companies = docs.map(doc => ({
        companyProfile: this.mapToEntity(doc as WithId<Document>),
        userEmail: doc.userEmail,
        isBlocked: doc.isBlocked
      }));

      return { companies, total };
    } catch (error) {
      throw new InternalError('Failed to list companies with filters', error as Error);
    }
  }
}
