import { Collection, ObjectId } from 'mongodb';
import { ICompanyProfileRepository } from '../../../domain/repositories/ICompanyProfileRepository';
import { CompanyProfile, CompanyProfileProps } from '../../../domain/entities/CompanyProfile';
import { getMongoDb } from './client';
import { InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';

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

  async create(profile: Omit<CompanyProfileProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyProfile> {
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
        createdAt: now,
        updatedAt: now,
      });

      await getMongoDb().collection('users').updateOne(
        { _id: new ObjectId(profile.userId) },
        { $set: { isProfileCompleted: true } }
      );

      return new CompanyProfile({
        id: result.insertedId.toString(),
        ...profile,
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
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}


