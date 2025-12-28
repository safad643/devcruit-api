import { Collection, ObjectId, WithId, Document, MongoServerError } from 'mongodb';
import { IJobFieldRepository, CreateJobFieldProps, UpdateJobFieldProps } from '../../../domain/repositories/IJobFieldRepository';
import { JobField, FieldType } from '../../../domain/entities/JobField';
import { getMongoDb } from './client';
import { InternalError, NotFoundError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { MongoGenericRepository } from './MongoGenericRepository';
import { toDate } from './utils/mapperUtils';

@injectable()
export class JobFieldRepository
    extends MongoGenericRepository<JobField, CreateJobFieldProps, UpdateJobFieldProps>
    implements IJobFieldRepository {

    protected _collection: Collection;

    constructor() {
        super();
        this._collection = getMongoDb().collection('job_fields');
        this._collection.createIndex({ type: 1, name: 1 }, { unique: true }).catch(() => { });
    }

    protected _getEntityName(): string {
        return 'Job field';
    }

    protected _mapToEntity(doc: WithId<Document>): JobField {
        return new JobField({
            id: doc._id.toString(),
            type: doc.type,
            name: doc.name,
            createdAt: toDate(doc.createdAt),
            updatedAt: toDate(doc.updatedAt),
        });
    }

    async create(data: CreateJobFieldProps): Promise<JobField> {
        try {
            const now = new Date();
            const result = await this._collection.insertOne({
                type: data.type,
                name: data.name,
                createdAt: now,
                updatedAt: now,
            });

            return this._mapToEntity({
                _id: result.insertedId,
                ...data,
                createdAt: now,
                updatedAt: now,
            });
        } catch (error) {
            if (error instanceof MongoServerError && error.code === 11000) {
                throw new InternalError(`${data.type} "${data.name}" already exists`);
            }
            throw new InternalError('Failed to create job field', error instanceof Error ? error : undefined);
        }
    }

    async update(id: string, data: UpdateJobFieldProps): Promise<JobField> {
        try {
            if (!ObjectId.isValid(id)) {
                throw new NotFoundError('Job field not found');
            }

            const result = await this._collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { name: data.name, updatedAt: new Date() } },
                { returnDocument: 'after' }
            );

            if (!result) {
                throw new NotFoundError('Job field not found');
            }

            return this._mapToEntity(result);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            if (error instanceof MongoServerError && error.code === 11000) {
                throw new InternalError('A field with this name already exists for this type');
            }
            throw new InternalError('Failed to update job field', error instanceof Error ? error : undefined);
        }
    }

    async findByTypeAndName(type: FieldType, name: string): Promise<JobField | null> {
        try {
            const doc = await this._collection.findOne({ type, name });
            if (!doc) return null;
            return this._mapToEntity(doc);
        } catch (error) {
            throw new InternalError('Database query failed', error as Error);
        }
    }

    async findAllByType(type: FieldType): Promise<JobField[]> {
        try {
            const docs = await this._collection.find({ type }).sort({ name: 1 }).toArray();
            return docs.map(doc => this._mapToEntity(doc));
        } catch (error) {
            throw new InternalError('Failed to list job fields', error as Error);
        }
    }

    async findMissingNames(type: FieldType, names: string[]): Promise<string[]> {
        if (names.length === 0) return [];

        try {
            const existingDocs = await this._collection
                .find({ type, name: { $in: names } })
                .project({ name: 1 })
                .toArray();

            const existingNames = new Set(existingDocs.map(doc => doc.name));
            return names.filter(name => !existingNames.has(name));
        } catch (error) {
            throw new InternalError('Failed to validate job field names', error as Error);
        }
    }
}
