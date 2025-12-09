import { Collection, ObjectId } from 'mongodb';
import { IUserRepository, CreateUserProps, UpdateUserProps } from '../../../domain/repositories/IUserRepository';
import { User, UserProps } from '../../../domain/entities/User';
import { getMongoDb } from './client';
import { ConflictError, InternalError, NotFoundError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { MongoGenericRepository } from './MongoGenericRepository';

@injectable()
export class UserRepository
  extends MongoGenericRepository<User, CreateUserProps, UpdateUserProps>
  implements IUserRepository {

  protected collection: Collection;

  constructor() {
    super();
    this.collection = getMongoDb().collection('users');
  }

  protected getEntityName(): string {
    return 'User';
  }

  protected mapToEntity(doc: any): User {
    return new User({
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name || doc.email?.split('@')[0] || 'User',
      password: doc.password,
      role: doc.role,
      isBlocked: doc.isBlocked,
      isProfileCompleted: doc.isProfileCompleted || false,
      authProviders: doc.authProviders || ['local'],
      googleId: doc.googleId,
      createdAt: doc.createdAt,
    });
  }

  async create(user: CreateUserProps): Promise<User> {
    try {
      const result = await this.collection.insertOne({
        email: user.email,
        name: user.name,
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

  async update(id: string, updates: UpdateUserProps): Promise<User> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new NotFoundError('User not found');
      }

      const { id: _id, createdAt, ...updateFields } = updates;

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('User not found');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalError('Failed to update user', error as Error);
    }
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

  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      const doc = await this.collection.findOne({ googleId });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }
}
