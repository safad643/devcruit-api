import { Collection, ObjectId, WithId, Document } from 'mongodb';
import { IAdminRepository } from '../../../domain/repositories';
import { Admin, AdminProps } from '../../../domain/entities/Admin';
import { getMongoDb } from './client';
import { InternalError, BadRequestError } from '../../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class AdminRepository implements IAdminRepository {
  private _collection: Collection;

  constructor() {
    this._collection = getMongoDb().collection('admins');
  }

  async findByEmail(email: string): Promise<Admin | null> {
    try {
      const doc = await this._collection.findOne({ email });
      if (!doc) return null;
      return this._mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findById(id: string): Promise<Admin | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid ID format');
      }
      const doc = await this._collection.findOne({ _id: new ObjectId(id) });
      if (!doc) return null;
      return this._mapToEntity(doc);
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new InternalError('Database query failed', error as Error);
    }
  }

  private _mapToEntity(doc: WithId<Document>): Admin {
    return new Admin({
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      role: doc.role,
      createdAt: doc.createdAt,
    });
  }
}

