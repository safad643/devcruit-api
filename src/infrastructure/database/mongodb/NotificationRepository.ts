import { Collection, ObjectId, WithId, Document } from 'mongodb';
import { INotificationRepository, CreateNotificationProps } from '../../../domain/repositories/INotificationRepository';
import { Notification, NotificationProps } from '../../../domain/entities/Notification';
import { getMongoDb } from './client';
import { InternalError, BadRequestError } from '../../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class NotificationRepository implements INotificationRepository {
    private _collection: Collection;

    constructor() {
        this._collection = getMongoDb().collection('notifications');
    }

    private _mapToEntity(doc: WithId<Document>): Notification {
        return new Notification({
            id: doc._id.toString(),
            userId: doc.userId,
            type: doc.type,
            title: doc.title,
            message: doc.message,
            read: doc.read,
            data: doc.data,
            createdAt: doc.createdAt,
        });
    }

    async create(notification: CreateNotificationProps): Promise<Notification> {
        try {
            const docToInsert = {
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                read: notification.read,
                data: notification.data,
                createdAt: notification.createdAt,
            };

            const result = await this._collection.insertOne(docToInsert);
            return this._mapToEntity({ _id: result.insertedId, ...docToInsert });
        } catch (error) {
            throw new InternalError('Failed to create notification', error instanceof Error ? error : undefined);
        }
    }

    async findById(id: string): Promise<Notification | null> {
        try {
            if (!ObjectId.isValid(id)) {
                throw new BadRequestError('Invalid notification ID');
            }
            const doc = await this._collection.findOne({ _id: new ObjectId(id) });
            if (!doc) return null;
            return this._mapToEntity(doc);
        } catch (error) {
            if (error instanceof BadRequestError) throw error;
            throw new InternalError('Database query failed', error as Error);
        }
    }

    async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
        try {
            const docs = await this._collection
                .find({ userId })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .toArray();

            return docs.map((doc) => this._mapToEntity(doc));
        } catch (error) {
            throw new InternalError('Failed to fetch notifications', error as Error);
        }
    }

    async markAsRead(id: string): Promise<void> {
        try {
            if (!ObjectId.isValid(id)) {
                throw new BadRequestError('Invalid notification ID');
            }
            await this._collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { read: true } }
            );
        } catch (error) {
            if (error instanceof BadRequestError) throw error;
            throw new InternalError('Failed to mark notification as read', error as Error);
        }
    }

    async markAllAsRead(userId: string): Promise<void> {
        try {
            await this._collection.updateMany(
                { userId, read: false },
                { $set: { read: true } }
            );
        } catch (error) {
            throw new InternalError('Failed to mark all notifications as read', error as Error);
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        try {
            return await this._collection.countDocuments({ userId, read: false });
        } catch (error) {
            throw new InternalError('Failed to get unread count', error as Error);
        }
    }

    async deleteOlderThan(days: number): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const result = await this._collection.deleteMany({
                createdAt: { $lt: cutoffDate }
            });

            return result.deletedCount;
        } catch (error) {
            throw new InternalError('Failed to delete old notifications', error as Error);
        }
    }
}
