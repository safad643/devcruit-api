import { Collection, ObjectId, WithId, Document } from 'mongodb';
import { IPlanRepository, CreatePlanData, UpdatePlanData } from '../../../domain/repositories/IPlanRepository';
import { Plan, PlanProps } from '../../../domain/entities/Plan';
import { getMongoDb } from './client';
import { InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { MongoGenericRepository } from './MongoGenericRepository';

@injectable()
export class PlanRepository
    extends MongoGenericRepository<Plan, CreatePlanData, UpdatePlanData>
    implements IPlanRepository {

    protected collection: Collection;

    constructor() {
        super();
        this.collection = getMongoDb().collection('plans');
        // Ensure unique plan names
        this.collection.createIndex({ name: 1 }, { unique: true }).catch(() => { });
        // Index for display order sorting
        this.collection.createIndex({ displayOrder: 1 }).catch(() => { });
    }

    protected getEntityName(): string {
        return 'Plan';
    }

    protected mapToEntity(doc: WithId<Document>): Plan {
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
            features: doc.features ?? [],
            displayOrder: doc.displayOrder ?? 0,
            isActive: doc.isActive ?? true,
            isOffer: doc.isOffer ?? false,
            offerLabel: doc.offerLabel,
            discountType: doc.discountType,
            discountValue: doc.discountValue,
            createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
            updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt),
        });
    }

    async create(data: CreatePlanData): Promise<Plan> {
        try {
            const now = new Date();
            const planData = Plan.create(data);

            const result = await this.collection.insertOne({
                ...planData,
                createdAt: now,
                updatedAt: now,
            });

            return this.mapToEntity({
                _id: result.insertedId,
                ...planData,
                createdAt: now,
                updatedAt: now,
            });
        } catch (error) {
            throw new InternalError('Failed to create plan', error instanceof Error ? error : undefined);
        }
    }

    async findActive(): Promise<Plan[]> {
        try {
            const docs = await this.collection
                .find({ isActive: true })
                .sort({ displayOrder: 1 })
                .toArray();
            return docs.map(doc => this.mapToEntity(doc));
        } catch (error) {
            throw new InternalError('Failed to fetch active plans', error as Error);
        }
    }

    async findAll(): Promise<Plan[]> {
        try {
            const docs = await this.collection
                .find({})
                .sort({ displayOrder: 1 })
                .toArray();
            return docs.map(doc => this.mapToEntity(doc));
        } catch (error) {
            throw new InternalError('Failed to fetch plans', error as Error);
        }
    }
}
