import { Collection, ObjectId, WithId, Document } from 'mongodb';
import { IGenericRepository } from '../../../domain/repositories/IGenericRepository';
import { InternalError, NotFoundError, BadRequestError } from '../../../domain/errors';

export abstract class MongoGenericRepository<T, CreateProps, UpdateProps = Partial<CreateProps>>
    implements IGenericRepository<T, CreateProps, UpdateProps> {

    protected abstract _collection: Collection;
    protected abstract _mapToEntity(doc: WithId<Document>): T;
    protected abstract _getEntityName(): string;

    async findById(id: string): Promise<T | null> {
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

    abstract create(data: CreateProps): Promise<T>;

    async update(id: string, data: UpdateProps): Promise<T> {
        try {
            if (!ObjectId.isValid(id)) {
                throw new BadRequestError('Invalid ID format');
            }

            const { id: _id, createdAt, ...updateFields } = data as any;

            const result = await this._collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { ...updateFields, updatedAt: new Date() } },
                { returnDocument: 'after' }
            );

            if (!result) {
                throw new NotFoundError(`${this._getEntityName()} not found`);
            }

            return this._mapToEntity(result);
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
            throw new InternalError(`Failed to update ${this._getEntityName().toLowerCase()}`, error as Error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            if (!ObjectId.isValid(id)) {
                throw new BadRequestError('Invalid ID format');
            }

            const result = await this._collection.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                throw new NotFoundError(`${this._getEntityName()} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
            throw new InternalError(`Failed to delete ${this._getEntityName().toLowerCase()}`, error as Error);
        }
    }
}
