import { Collection, ObjectId, WithId, Document, MongoServerError } from 'mongodb';
import { IPlanRepository, CreatePlanData, UpdatePlanData } from '../../../domain/repositories/IPlanRepository';
import { Plan, PlanProps } from '../../../domain/entities/Plan';
import { getMongoDb } from './client';
import { ConflictError, InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { MongoGenericRepository } from './MongoGenericRepository';
import { toDate, toArray } from './utils/mapperUtils';

@injectable()
export class PlanRepository
    extends MongoGenericRepository<Plan, CreatePlanData, UpdatePlanData>
    implements IPlanRepository {

    protected _collection: Collection;

    constructor() {
        super();
        this._collection = getMongoDb().collection('plans');

    }

    protected _getEntityName(): string {
        return 'Plan';
    }

    protected _mapToEntity(doc: WithId<Document>): Plan {
        return new Plan({
            id: doc._id.toString(),
            name: doc.name,
            description: doc.description,
            price: doc.price,
            currency: doc.currency,
            durationMonths: doc.durationMonths,
            limits: {
                maxActiveJobs: doc.limits?.maxActiveJobs ?? null,
                maxTeamMembers: doc.limits?.maxTeamMembers ?? null,
            },
            features: toArray(doc.features),
            displayOrder: doc.displayOrder ?? 0,
            isActive: doc.isActive ?? true,
            isOffer: doc.isOffer ?? false,
            offerLabel: doc.offerLabel,
            discountType: doc.discountType,
            discountValue: doc.discountValue,
            createdAt: toDate(doc.createdAt),
            updatedAt: toDate(doc.updatedAt),
        });
    }

    async create(data: CreatePlanData): Promise<Plan> {
        try {
            const now = new Date();
            const planData = Plan.create(data);
            const docToInsert = {
                ...planData,
                createdAt: now,
                updatedAt: now,
            };

            const result = await this._collection.insertOne(docToInsert);

            return this._mapToEntity({ _id: result.insertedId, ...docToInsert });
        } catch (error) {
            if (error instanceof MongoServerError && error.code === 11000) {
                throw new ConflictError('Plan with this name already exists');
            }
            throw new InternalError('Failed to create plan', error instanceof Error ? error : undefined);
        }
    }

    async findActive(): Promise<Plan[]> {
        try {
            const docs = await this._collection
                .find({ isActive: true })
                .sort({ displayOrder: 1 })
                .toArray();
            return docs.map(doc => this._mapToEntity(doc));
        } catch (error) {
            throw new InternalError('Failed to fetch active plans', error as Error);
        }
    }

    async findAll(): Promise<Plan[]> {
        try {
            const docs = await this._collection
                .find({})
                .sort({ displayOrder: 1 })
                .toArray();
            return docs.map(doc => this._mapToEntity(doc));
        } catch (error) {
            throw new InternalError('Failed to fetch plans', error as Error);
        }
    }

    async findAllPaginated(page: number, limit: number): Promise<Plan[]> {
        try {
            const skip = (page - 1) * limit;
            const docs = await this._collection
                .find({})
                .sort({ displayOrder: 1 })
                .skip(skip)
                .limit(limit)
                .toArray();
            return docs.map(doc => this._mapToEntity(doc));
        } catch (error) {
            throw new InternalError('Failed to fetch plans', error as Error);
        }
    }

    async countAll(): Promise<number> {
        try {
            return await this._collection.countDocuments({});
        } catch (error) {
            throw new InternalError('Failed to count plans', error as Error);
        }
    }
}
