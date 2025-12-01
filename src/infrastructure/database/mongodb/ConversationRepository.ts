import { Collection, ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { Conversation, ConversationProps } from '../../../domain/entities/Conversation';
import { getMongoDb } from './client';
import { InternalError } from '../../../domain/errors';

interface ConversationDocument {
  _id: ObjectId;
  participant1Id: string;
  participant2Id: string;
  companyId?: string;
  lastMessageAt: Date;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

@injectable()
export class ConversationRepository implements IConversationRepository {
  private collection: Collection<ConversationDocument>;

  constructor() {
    this.collection = getMongoDb().collection<ConversationDocument>('conversations');
  }

  async create(conversation: Omit<ConversationProps, 'id'>): Promise<Conversation> {
    try {
      const [participant1Id, participant2Id] = 
        conversation.participant1Id < conversation.participant2Id
          ? [conversation.participant1Id, conversation.participant2Id]
          : [conversation.participant2Id, conversation.participant1Id];

      const doc = {
        participant1Id,
        participant2Id,
        companyId: conversation.companyId,
        lastMessageAt: conversation.lastMessageAt,
        lastMessage: conversation.lastMessage,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };

      const result = await this.collection.insertOne(doc as any);
      return this.mapToEntity({
        _id: result.insertedId,
        ...doc,
      } as ConversationDocument);
    } catch (error) {
      throw new InternalError('Failed to create conversation', error as Error);
    }
  }

  async findById(id: string): Promise<Conversation | null> {
    try {
      if (!ObjectId.isValid(id)) return null;
      const doc = await this.collection.findOne({ _id: new ObjectId(id) });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findByParticipants(
    participant1Id: string,
    participant2Id: string
  ): Promise<Conversation | null> {
    try {
      // Normalize participant order for consistent lookup
      const [p1, p2] = participant1Id < participant2Id
        ? [participant1Id, participant2Id]
        : [participant2Id, participant1Id];

      const doc = await this.collection.findOne({
        participant1Id: p1,
        participant2Id: p2,
      });
      if (!doc) return null;
      return this.mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    try {
      const docs = await this.collection
        .find({
          $or: [
            { participant1Id: userId },
            { participant2Id: userId },
          ],
        })
        .sort({ lastMessageAt: -1 })
        .toArray();
      return docs.map(doc => this.mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async update(id: string, updates: Partial<ConversationProps>): Promise<Conversation> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new InternalError('Invalid conversation ID format');
      }

      const { 
        id: _id, 
        createdAt, 
        participant1Id, 
        participant2Id, 
        companyId,
        ...updateFields 
      } = updates;
      
      const updatePayload: Partial<Omit<ConversationDocument, '_id' | 'participant1Id' | 'participant2Id' | 'companyId' | 'createdAt'>> = {
        ...updateFields,
        updatedAt: new Date(),
      };

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new InternalError('Conversation not found');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to update conversation', error as Error);
    }
  }

  async updateLastMessage(
    id: string,
    lastMessage: string,
    lastMessageAt: Date
  ): Promise<Conversation> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new InternalError('Invalid conversation ID format');
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            lastMessage,
            lastMessageAt,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new InternalError('Conversation not found');
      }

      return this.mapToEntity(result);
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError('Failed to update last message', error as Error);
    }
  }

  private mapToEntity(doc: ConversationDocument): Conversation {
    return new Conversation({
      id: doc._id.toString(),
      participant1Id: doc.participant1Id,
      participant2Id: doc.participant2Id,
      companyId: doc.companyId,
      lastMessageAt: doc.lastMessageAt instanceof Date 
        ? doc.lastMessageAt 
        : new Date(doc.lastMessageAt),
      lastMessage: doc.lastMessage,
      createdAt: doc.createdAt instanceof Date 
        ? doc.createdAt 
        : new Date(doc.createdAt),
      updatedAt: doc.updatedAt instanceof Date 
        ? doc.updatedAt 
        : new Date(doc.updatedAt),
    });
  }
}

