import { Collection, ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { IMessageRepository, MessageListFilters, MessageListResult, CreateMessageProps, UpdateMessageProps } from '../../../domain/repositories/IMessageRepository';
import { Message, MessageProps } from '../../../domain/entities/Message';
import { getMongoDb } from './client';
import { InternalError, NotFoundError } from '../../../domain/errors';
import { MongoGenericRepository } from './MongoGenericRepository';

@injectable()
export class MessageRepository
  extends MongoGenericRepository<Message, CreateMessageProps, UpdateMessageProps>
  implements IMessageRepository {

  protected collection: Collection;

  constructor() {
    super();
    this.collection = getMongoDb().collection('messages');
  }

  protected getEntityName(): string {
    return 'Message';
  }

  protected mapToEntity(doc: any): Message {
    return new Message({
      id: doc._id.toString(),
      conversationId: doc.conversationId,
      senderId: doc.senderId,
      message: doc.message,
      readAt: doc.readAt ? (doc.readAt instanceof Date ? doc.readAt : new Date(doc.readAt)) : null,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
    });
  }

  async create(message: CreateMessageProps): Promise<Message> {
    try {
      const result = await this.collection.insertOne({
        conversationId: message.conversationId,
        senderId: message.senderId,
        message: message.message,
        readAt: message.readAt,
        createdAt: message.createdAt,
      });

      const doc = await this.collection.findOne({ _id: result.insertedId });
      if (!doc) {
        throw new InternalError('Failed to retrieve created message');
      }
      return this.mapToEntity(doc);
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
      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('Message not found');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalError('Failed to update message', error as Error);
    }
  }

  async findByConversationId(filters: MessageListFilters): Promise<MessageListResult> {
    try {
      const { conversationId, limit, beforeDate } = filters;
      const query: any = { conversationId };
      if (beforeDate) query.createdAt = { $lt: beforeDate };

      const total = await this.collection.countDocuments({ conversationId });

      const docs = await this.collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .toArray();

      const hasMore = docs.length > limit;
      const messagesToReturn = hasMore ? docs.slice(0, limit) : docs;
      const messages = messagesToReturn.reverse().map(doc => this.mapToEntity(doc));

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

      await this.collection.updateMany(
        { _id: { $in: objectIds }, conversationId, senderId: { $ne: userId }, readAt: null },
        { $set: { readAt: new Date() } }
      );
    } catch (error) {
      throw new InternalError('Failed to mark messages as read', error as Error);
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await this.collection.updateMany(
        { conversationId, senderId: { $ne: userId }, readAt: null },
        { $set: { readAt: new Date() } }
      );
    } catch (error) {
      throw new InternalError('Failed to mark conversation as read', error as Error);
    }
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    try {
      return await this.collection.countDocuments({
        conversationId,
        senderId: { $ne: userId },
        readAt: null,
      });
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }
}
