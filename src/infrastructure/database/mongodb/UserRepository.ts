import { Collection, ObjectId } from 'mongodb';
import { IUserRepository } from '../../../domain/repositories';
import { User, UserProps } from '../../../domain/entities/User';
import { getMongoDb } from './client';
import { ConflictError, InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { AuthProvider } from '../../../domain/entities/User';
@injectable()
export class UserRepository implements IUserRepository {
  private collection: Collection;

  constructor() {
    this.collection = getMongoDb().collection('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const doc = await this.collection.findOne({ email });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      if (!ObjectId.isValid(id)) return null;
      const doc = await this.collection.findOne({ _id: new ObjectId(id) });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async create(user: Omit<UserProps, 'id'>): Promise<User> {
    try {
      const result = await this.collection.insertOne({
        email: user.email,
        password: user.password,
        role: user.role,
        isBlocked: user.isBlocked,
        isProfileCompleted: user.isProfileCompleted,
        authProviders: user.authProviders,
        googleId: user.googleId,
        createdAt: user.createdAt,
      });
  
      return new User({
        id: result.insertedId.toString(),
        ...user,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError('Email already registered');
      }
      throw new InternalError('Failed to create user', error);
    }
  }
  

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new InternalError('Invalid user ID format');
      }
      
      const result = await this.collection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: newPassword } }
      );

      if (result.matchedCount === 0) {
        throw new InternalError('User not found for password update');
      }
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to update password', error as Error);
    }
  }

  async blockUser(userId: string): Promise<void> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new InternalError('Invalid user ID format');
      }

      await this.collection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { isBlocked: true } }
      );
    } catch (error) {
      throw new InternalError('Failed to block user', error as Error);
    }
  }

  async unblockUser(userId: string): Promise<void> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new InternalError('Invalid user ID format');
      }

      await this.collection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { isBlocked: false } }
      );
    } catch (error) {
      throw new InternalError('Failed to unblock user', error as Error);
    }
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      const doc = await this.collection.findOne({ googleId });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }
  
  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new InternalError('Invalid user ID format');
      }
      
      const result = await this.collection.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { googleId },
          $addToSet: { authProviders: 'google' }
        }
      );
  
      if (result.matchedCount === 0) {
        throw new InternalError('User not found for Google account linking');
      }
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to link Google account', error as Error);
    }
  }
  
  async addAuthProvider(userId: string, provider: AuthProvider): Promise<void> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new InternalError('Invalid user ID format');
      }
  
      const result = await this.collection.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { authProviders: provider } }
      );
  
      if (result.matchedCount === 0) {
        throw new InternalError('User not found for auth provider update');
      }
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to add auth provider', error as Error);
    }
  }

  async updateProfileCompletedStatus(userId: string, status: boolean): Promise<void> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new InternalError('Invalid user ID format');
      }
  
      const result = await this.collection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { isProfileCompleted: status } }
      );
  
      if (result.matchedCount === 0) {
        throw new InternalError('User not found for profile status update');
      }
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to update profile status', error as Error);
    }
  }
  

  private mapToEntity(doc: any): User {
    return new User({
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      role: doc.role,
      isBlocked: doc.isBlocked,
      isProfileCompleted: doc.isProfileCompleted || false,  // Default to false for old records
      authProviders: doc.authProviders || ['local'],  // Default for old records
      googleId: doc.googleId,
      createdAt: doc.createdAt,
    });
  }
  
}
