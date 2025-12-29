import { Collection, ObjectId, WithId, Document, MongoServerError } from 'mongodb';
import { IUserRepository, CreateUserProps, UpdateUserProps } from '../../../domain/repositories/IUserRepository';
import { User, UserProps } from '../../../domain/entities/User';
import { getMongoDb } from './client';
import { ConflictError, InternalError, NotFoundError, BadRequestError } from '../../../domain/errors';
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
      const docToInsert = {
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        isBlocked: user.isBlocked,
        isProfileCompleted: user.isProfileCompleted,
        authProviders: user.authProviders,
        googleId: user.googleId,
        createdAt: user.createdAt,
      };

      const result = await this._collection.insertOne(docToInsert);

      return this._mapToEntity({ _id: result.insertedId, ...docToInsert });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictError('Email already registered');
      }
      throw new InternalError('Failed to create user', error instanceof Error ? error : undefined);
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

  async getUserStats(): Promise<{ total: number; developers: number; companies: number; blocked: number }> {
    try {
      const result = await this._collection.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
            blocked: [{ $match: { isBlocked: true } }, { $count: 'count' }]
          }
        }
      ]).toArray();

      const facetResult = result[0] || { total: [], byRole: [], blocked: [] };
      const stats = { total: 0, developers: 0, companies: 0, blocked: 0 };

      stats.total = facetResult.total[0]?.count || 0;
      stats.blocked = facetResult.blocked[0]?.count || 0;

      for (const r of facetResult.byRole) {
        if (r._id === 'developer') stats.developers = r.count;
        if (r._id === 'company') stats.companies = r.count;
      }

      return stats;
    } catch (error) {
      throw new InternalError('Failed to get user stats', error as Error);
    }
  }

  async getSignupTrend(days: number): Promise<{ date: string; developers: number; companies: number }[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days + 1);
      startDate.setHours(0, 0, 0, 0);

      const result = await this._collection.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              role: '$role'
            },
            count: { $sum: 1 }
          }
        }
      ]).toArray();

      // Build trend array for each day
      const trend: { date: string; developers: number; companies: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split('T')[0];

        const devCount = result.find(r => r._id.date === dateStr && r._id.role === 'developer')?.count || 0;
        const compCount = result.find(r => r._id.date === dateStr && r._id.role === 'company')?.count || 0;

        trend.push({ date: dateStr, developers: devCount, companies: compCount });
      }

      return trend;
    } catch (error) {
      throw new InternalError('Failed to get signup trend', error as Error);
    }
  }
}

