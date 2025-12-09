import { Collection, ObjectId, WithId, Document } from 'mongodb';
import { IAdminRepository } from '../../../domain/repositories';
import { Admin, AdminProps } from '../../../domain/entities/Admin';
import { getMongoDb } from './client';
import { InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class AdminRepository implements IAdminRepository {
  private collection: Collection;

  constructor() {
    this.collection = getMongoDb().collection('admins');
  }

  async findByEmail(email: string): Promise<Admin | null> {
    try {
      const doc = await this.collection.findOne({ email });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findById(id: string): Promise<Admin | null> {
    try {
      if (!ObjectId.isValid(id)) return null;
      const doc = await this.collection.findOne({ _id: new ObjectId(id) });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  private mapToEntity(doc: WithId<Document>): Admin {
    return new Admin({
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      role: doc.role,
      createdAt: doc.createdAt,
    });
  }
}

