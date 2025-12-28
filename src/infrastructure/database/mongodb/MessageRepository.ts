import { Collection, ObjectId, WithId, Document, Filter } from 'mongodb';
import { injectable } from 'inversify';
import { IMessageRepository, MessageListFilters, MessageListResult, CreateMessageProps, UpdateMessageProps } from '../../../domain/repositories/IMessageRepository';
import { Message, MessageProps } from '../../../domain/entities/Message';
import { getMongoDb } from './client';
import { InternalError, NotFoundError } from '../../../domain/errors';
import { MongoGenericRepository } from './MongoGenericRepository';
import { toDate, toDateOptional } from './utils/mapperUtils';

@injectable()
export class MessageRepository
  extends MongoGenericRepository<Message, CreateMessageProps, UpdateMessageProps>
  implements IMessageRepository {

  protected _collection: Collection;

  constructor() {
    super();
    this._collection = getMongoDb().collection('messages');
  }

  protected _getEntityName(): string {
    return 'Message';
  }

  protected _mapToEntity(doc: WithId<Document>): Message {
    return new Message({
      id: doc._id.toString(),
      conversationId: doc.conversationId,
      senderId: doc.senderId,
      message: doc.message,
      readAt: toDateOptional(doc.readAt) ?? null,
      createdAt: toDate(doc.createdAt),
    });
  }

  async create(message: CreateMessageProps): Promise<Message> {
    try {
      const result = await this._collection.insertOne({
        conversationId: message.conversationId,
        senderId: message.senderId,
        message: message.message,
        readAt: message.readAt,
        createdAt: message.createdAt,
      });

      const doc = await this._collection.findOne({ _id: result.insertedId });
      if (!doc) {
        throw new InternalError('Failed to retrieve created message');
      }
      return this._mapToEntity(doc);
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to create message', error as Error);
    }
  }

  async update(id: string, updates: UpdateMessageProps): Promise<Message> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new NotFoundError('Message not found');
      }

      const { id: _id, ...updateFields } = updates;
      const result = await this._collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('Message not found');
      }

      return this._mapToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalError('Failed to update message', error as Error);
    }
  }

  async findByConversationId(filters: MessageListFilters): Promise<MessageListResult> {
    try {
      const { conversationId, limit, beforeDate } = filters;
      const query: Filter<Document> = { conversationId };
      if (beforeDate) query.createdAt = { $lt: beforeDate };

      const total = await this._collection.countDocuments({ conversationId });

      const docs = await this._collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .toArray();

      const hasMore = docs.length > limit;
      const messagesToReturn = hasMore ? docs.slice(0, limit) : docs;
      const messages = messagesToReturn.reverse().map(doc => this._mapToEntity(doc));

      return { messages, total, hasMore };
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async markAsRead(messageIds: string[], conversationId: string, userId: string): Promise<void> {
    try {
      if (messageIds.length === 0) return;

      const objectIds = messageIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
      if (objectIds.length === 0) return;

      await this._collection.updateMany(
        { _id: { $in: objectIds }, conversationId, senderId: { $ne: userId }, readAt: null },
        { $set: { readAt: new Date() } }
      );
    } catch (error) {
      throw new InternalError('Failed to mark messages as read', error as Error);
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await this._collection.updateMany(
        { conversationId, senderId: { $ne: userId }, readAt: null },
        { $set: { readAt: new Date() } }
      );
    } catch (error) {
      throw new InternalError('Failed to mark conversation as read', error as Error);
    }
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    try {
      return await this._collection.countDocuments({
        conversationId,
        senderId: { $ne: userId },
        readAt: null,
      });
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }
}
