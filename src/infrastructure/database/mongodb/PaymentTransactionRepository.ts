import { Collection, ObjectId, WithId, Document, MongoServerError } from 'mongodb';
import { IPaymentTransactionRepository, CreatePaymentTransactionData } from '../../../domain/repositories/IPaymentTransactionRepository';
import { PaymentTransaction } from '../../../domain/entities/PaymentTransaction';
import { getMongoDb } from './client';
import { ConflictError, InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { MongoGenericRepository } from './MongoGenericRepository';
import { toDate } from './utils/mapperUtils';

@injectable()
export class PaymentTransactionRepository
    extends MongoGenericRepository<PaymentTransaction, CreatePaymentTransactionData, never>
    implements IPaymentTransactionRepository {

    protected _collection: Collection;

    constructor() {
        super();
        this._collection = getMongoDb().collection('payment_transactions');

    }

    protected _getEntityName(): string {
        return 'Payment transaction';
    }

    protected _mapToEntity(doc: WithId<Document>): PaymentTransaction {
        return new PaymentTransaction({
            id: doc._id.toString(),
            userId: doc.userId,
            companyId: doc.companyId,
            planSnapshot: {
                planName: doc.planSnapshot?.planName ?? '',
                price: doc.planSnapshot?.price ?? 0,
                finalPrice: doc.planSnapshot?.finalPrice ?? 0,
                durationMonths: doc.planSnapshot?.durationMonths ?? 0,
                limits: {
                    maxActiveJobs: doc.planSnapshot?.limits?.maxActiveJobs ?? null,
                    maxTeamMembers: doc.planSnapshot?.limits?.maxTeamMembers ?? null,
                },
            },
            stripeSessionId: doc.stripeSessionId,
            stripePaymentIntentId: doc.stripePaymentIntentId,
            status: doc.status,
            paidAt: toDate(doc.paidAt),
            createdAt: toDate(doc.createdAt),
        });
    }

    async create(data: CreatePaymentTransactionData): Promise<PaymentTransaction> {
        try {
            const now = new Date();
            const txData = PaymentTransaction.create(data);
            const docToInsert = {
                ...txData,
                createdAt: now,
            };

            const result = await this._collection.insertOne(docToInsert);

            return this._mapToEntity({ _id: result.insertedId, ...docToInsert });
        } catch (error) {
            if (error instanceof MongoServerError && error.code === 11000) {
                throw new ConflictError('Payment transaction with this session ID already exists');
            }
            throw new InternalError('Failed to create payment transaction', error instanceof Error ? error : undefined);
        }
    }

    async findByUserId(userId: string): Promise<PaymentTransaction[]> {
        try {
            const docs = await this._collection
                .find({ userId })
                .sort({ createdAt: -1 })
                .toArray();
            return docs.map(doc => this._mapToEntity(doc));
        } catch (error) {
            throw new InternalError('Failed to fetch payment transactions', error as Error);
        }
    }

    async findByCompanyId(companyId: string): Promise<PaymentTransaction[]> {
        try {
            const docs = await this._collection
                .find({ companyId })
                .sort({ createdAt: -1 })
                .toArray();
            return docs.map(doc => this._mapToEntity(doc));
        } catch (error) {
            throw new InternalError('Failed to fetch payment transactions', error as Error);
        }
    }

    async findByStripeSessionId(sessionId: string): Promise<PaymentTransaction | null> {
        try {
            const doc = await this._collection.findOne({ stripeSessionId: sessionId });
            if (!doc) return null;
            return this._mapToEntity(doc);
        } catch (error) {
            throw new InternalError('Failed to fetch payment transaction', error as Error);
        }
    }
}
