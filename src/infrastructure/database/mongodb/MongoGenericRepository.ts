import { Collection, ObjectId } from 'mongodb';
import { IGenericRepository } from '../../../domain/repositories/IGenericRepository';
import { InternalError, NotFoundError } from '../../../domain/errors';

export abstract class MongoGenericRepository<T, CreateProps, UpdateProps = Partial<CreateProps>>
    implements IGenericRepository<T, CreateProps, UpdateProps> {

    protected abstract collection: Collection;
    protected abstract mapToEntity(doc: any): T;
    protected abstract getEntityName(): string;

    async findById(id: string): Promise<T | null> {
        try {
            if (!ObjectId.isValid(id)) return null;
            const doc = await this.collection.findOne({ _id: new ObjectId(id) });
            if (!doc) return null;
            return this.mapToEntity(doc);
        } catch (error) {
            throw new InternalError('Database query failed', error as Error);
        }
    }

    abstract create(data: CreateProps): Promise<T>;

    async update(id: string, data: UpdateProps): Promise<T> {
        try {
            if (!ObjectId.isValid(id)) {
                throw new NotFoundError(`${this.getEntityName()} not found`);
            }

            const result = await this.collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { ...data, updatedAt: new Date() } },
                { returnDocument: 'after' }
            );

            if (!result) {
                throw new NotFoundError(`${this.getEntityName()} not found`);
            }

            return this.mapToEntity(result);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new InternalError(`Failed to update ${this.getEntityName().toLowerCase()}`, error as Error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            if (!ObjectId.isValid(id)) {
                throw new NotFoundError(`${this.getEntityName()} not found`);
            }

            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                throw new NotFoundError(`${this.getEntityName()} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new InternalError(`Failed to delete ${this.getEntityName().toLowerCase()}`, error as Error);
        }
    }
}
