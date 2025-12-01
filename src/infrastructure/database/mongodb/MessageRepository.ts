import { Collection, ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import {
  IMessageRepository,
  MessageListFilters,
  MessageListResult,
} from '../../../domain/repositories/IMessageRepository';
import { Message, MessageProps } from '../../../domain/entities/Message';
import { getMongoDb } from './client';
import { InternalError } from '../../../domain/errors';

interface MessageDocument {
  _id: ObjectId;
  conversationId: string;
  senderId: string;
  message: string;
  readAt: Date | null;
  createdAt: Date;
}

@injectable()
export class MessageRepository implements IMessageRepository {
  private collection: Collection<MessageDocument>;

  constructor() {
    this.collection = getMongoDb().collection<MessageDocument>('messages');
  }

  async create(message: Omit<MessageProps, 'id'>): Promise<Message> {
    try {
      const result = await this.collection.insertOne({
        conversationId: message.conversationId,
        senderId: message.senderId,
        message: message.message,
        readAt: message.readAt,
        createdAt: message.createdAt,
      } as MessageDocument);

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

  async findById(id: string): Promise<Message | null> {
    try {
      if (!ObjectId.isValid(id)) return null;
      const doc = await this.collection.findOne({ _id: new ObjectId(id) });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findByConversationId(filters: MessageListFilters): Promise<MessageListResult> {
    try {
      const { conversationId, limit, beforeDate } = filters;

      const query: { conversationId: string; createdAt?: { $lt: Date } } = { conversationId };
      if (beforeDate) {
        query.createdAt = { $lt: beforeDate };
      }

      const total = await this.collection.countDocuments({ conversationId });

      const docs = await this.collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .toArray();

      const hasMore = docs.length > limit;
      const messagesToReturn = hasMore ? docs.slice(0, limit) : docs;

      const messages = messagesToReturn.reverse().map(doc => this.mapToEntity(doc));

      return {
        messages,
        total,
        hasMore,
      };
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async markAsRead(messageIds: string[], conversationId: string, userId: string): Promise<void> {
    try {
      if (messageIds.length === 0) return;

      const objectIds = messageIds
        .filter(id => ObjectId.isValid(id))
        .map(id => new ObjectId(id));

      if (objectIds.length === 0) return;

      // Mark messages as read only if they belong to the conversation and were sent by someone other than the user
      await this.collection.updateMany(
        {
          _id: { $in: objectIds },
          conversationId,
          senderId: { $ne: userId }, // Only mark messages sent by others
          readAt: null,
        },
        {
          $set: {
            readAt: new Date(),
          },
        }
      );
    } catch (error) {
      throw new InternalError('Failed to mark messages as read', error as Error);
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      // Mark all messages in conversation as read that were sent by someone other than the user
      await this.collection.updateMany(
        {
          conversationId,
          senderId: { $ne: userId }, // Only mark messages sent by others
          readAt: null,
        },
        {
          $set: {
            readAt: new Date(),
          },
        }
      );
    } catch (error) {
      throw new InternalError('Failed to mark conversation as read', error as Error);
    }
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    try {
      // Count messages sent by others (not by the user) that are unread
      return await this.collection.countDocuments({
        conversationId,
        senderId: { $ne: userId }, // Messages sent by others
        readAt: null,
      });
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  private mapToEntity(doc: MessageDocument | any): Message {
    return new Message({
      id: doc._id.toString(),
      conversationId: doc.conversationId,
      senderId: doc.senderId,
      message: doc.message,
      readAt: doc.readAt
        ? doc.readAt instanceof Date
          ? doc.readAt
          : new Date(doc.readAt)
        : null,
      createdAt: doc.createdAt instanceof Date
        ? doc.createdAt
        : new Date(doc.createdAt),
    });
  }
}

