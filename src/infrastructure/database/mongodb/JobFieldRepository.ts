import { Collection, ObjectId } from 'mongodb';
import { IJobFieldRepository } from '../../../domain/repositories/IJobFieldRepository';
import { JobField, JobFieldProps, FieldType } from '../../../domain/entities/JobField';
import { getMongoDb } from './client';
import { InternalError, NotFoundError } from '../../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class JobFieldRepository implements IJobFieldRepository {
    private collection: Collection;

    constructor() {
        this.collection = getMongoDb().collection('job_fields');
        // Create compound unique index on type + name
        this.collection.createIndex({ type: 1, name: 1 }, { unique: true }).catch(() => {
            // Index already exists or will be created on first insert
        });
    }

    async create(data: Omit<JobFieldProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobField> {
        try {
            const now = new Date();
            const result = await this.collection.insertOne({
                type: data.type,
                name: data.name,
                createdAt: now,
                updatedAt: now,
            });

            return this.mapToEntity({
                _id: result.insertedId,
                ...data,
                createdAt: now,
                updatedAt: now,
            });
        } catch (error: any) {
            if (error?.code === 11000) {
                throw new InternalError(`${data.type} "${data.name}" already exists`);
            }
            throw new InternalError('Failed to create job field', error as Error);
        }
    }

    async findById(id: string): Promise<JobField | null> {
        try {
            if (!ObjectId.isValid(id)) return null;
            const doc = await this.collection.findOne({ _id: new ObjectId(id) });
            if (!doc) return null;
            return this.mapToEntity(doc);
        } catch (error) {
            throw new InternalError('Database query failed', error as Error);
        }
    }

    async findByTypeAndName(type: FieldType, name: string): Promise<JobField | null> {
        try {
            const doc = await this.collection.findOne({ type, name });
            if (!doc) return null;
            return this.mapToEntity(doc);
        } catch (error) {
            throw new InternalError('Database query failed', error as Error);
        }
    }

    async findAllByType(type: FieldType): Promise<JobField[]> {
        try {
            const docs = await this.collection.find({ type }).sort({ name: 1 }).toArray();
            return docs.map(doc => this.mapToEntity(doc));
        } catch (error) {
            throw new InternalError('Failed to list job fields', error as Error);
        }
    }

    async update(id: string, data: { name: string }): Promise<JobField> {
        try {
            if (!ObjectId.isValid(id)) {
                throw new NotFoundError('Job field not found');
            }

            const result = await this.collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { name: data.name, updatedAt: new Date() } },
                { returnDocument: 'after' }
            );

            if (!result) {
                throw new NotFoundError('Job field not found');
            }

            return this.mapToEntity(result);
        } catch (error: any) {
            if (error instanceof NotFoundError) throw error;
            if (error?.code === 11000) {
                throw new InternalError('A field with this name already exists for this type');
            }
            throw new InternalError('Failed to update job field', error as Error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            if (!ObjectId.isValid(id)) {
                throw new NotFoundError('Job field not found');
            }
            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) {
                throw new NotFoundError('Job field not found');
            }
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new InternalError('Failed to delete job field', error as Error);
        }
    }

    async findMissingNames(type: FieldType, names: string[]): Promise<string[]> {
        if (names.length === 0) return [];

        try {
            const existingDocs = await this.collection
                .find({ type, name: { $in: names } })
                .project({ name: 1 })
                .toArray();

            const existingNames = new Set(existingDocs.map(doc => doc.name));
            return names.filter(name => !existingNames.has(name));
        } catch (error) {
            throw new InternalError('Failed to validate job field names', error as Error);
        }
    }

    private mapToEntity(doc: any): JobField {
        return new JobField({
            id: doc._id.toString(),
            type: doc.type,
            name: doc.name,
            createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
            updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt),
        });
    }
}
