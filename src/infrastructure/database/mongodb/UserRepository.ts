import { Collection, ObjectId, WithId, Document, MongoServerError } from 'mongodb';
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

  protected _collection: Collection;

  constructor() {
    super();
    this._collection = getMongoDb().collection('users');
  }

  protected _getEntityName(): string {
    return 'User';
  }

  protected _mapToEntity(doc: WithId<Document>): User {
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
      const result = await this._collection.insertOne({
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
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictError('Email already registered');
      }
      throw new InternalError('Failed to create user', error instanceof Error ? error : undefined);
    }
  }

  async update(id: string, updates: UpdateUserProps): Promise<User> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new NotFoundError('User not found');
      }

      const { id: _id, createdAt, ...updateFields } = updates;

      const result = await this._collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('User not found');
      }

      return this._mapToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalError('Failed to update user', error as Error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const doc = await this._collection.findOne({ email });
      if (!doc) return null;
      return this._mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      const doc = await this._collection.findOne({ googleId });
      if (!doc) return null;
      return this._mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }
}
