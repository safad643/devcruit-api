import { Collection, ObjectId, WithId, Document, OptionalId } from 'mongodb';
import { injectable } from 'inversify';
import { IConversationRepository, CreateConversationProps, UpdateConversationProps } from '../../../domain/repositories/IConversationRepository';
import { Conversation, ConversationProps } from '../../../domain/entities/Conversation';
import { getMongoDb } from './client';
import { InternalError, NotFoundError, BadRequestError } from '../../../domain/errors';
import { MongoGenericRepository } from './MongoGenericRepository';
import { toDate } from './utils/mapperUtils';

@injectable()
export class ConversationRepository
  extends MongoGenericRepository<Conversation, CreateConversationProps, UpdateConversationProps>
  implements IConversationRepository {

  protected _collection: Collection;

  constructor() {
    super();
    this._collection = getMongoDb().collection('conversations');
  }

  protected _getEntityName(): string {
    return 'Conversation';
  }

  protected _mapToEntity(doc: WithId<Document>): Conversation {
    return new Conversation({
      id: doc._id.toString(),
      participant1Id: doc.participant1Id,
      participant2Id: doc.participant2Id,
      companyId: doc.companyId,
      lastMessageAt: toDate(doc.lastMessageAt),
      lastMessage: doc.lastMessage,
      createdAt: toDate(doc.createdAt),
      updatedAt: toDate(doc.updatedAt),
    });
  }

  async create(conversation: CreateConversationProps): Promise<Conversation> {
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

      const result = await this._collection.insertOne(doc as OptionalId<Document>);
      return this._mapToEntity({ _id: result.insertedId, ...doc });
    } catch (error) {
      throw new InternalError('Failed to create conversation', error as Error);
    }
  }

  async update(id: string, updates: UpdateConversationProps): Promise<Conversation> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid ID format');
      }

      const { id: _id, createdAt, participant1Id, participant2Id, companyId, ...updateFields } = updates;
      const updatePayload = { ...updateFields, updatedAt: new Date() };

      const result = await this._collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('Conversation not found');
      }

      return this._mapToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
      throw new InternalError('Failed to update conversation', error as Error);
    }
  }

  async findByParticipants(participant1Id: string, participant2Id: string): Promise<Conversation | null> {
    try {
      const [p1, p2] = participant1Id < participant2Id
        ? [participant1Id, participant2Id]
        : [participant2Id, participant1Id];

      const doc = await this._collection.findOne({ participant1Id: p1, participant2Id: p2 });
      if (!doc) return null;
      return this._mapToEntity(doc);
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    try {
      const docs = await this._collection
        .find({ $or: [{ participant1Id: userId }, { participant2Id: userId }] })
        .sort({ lastMessageAt: -1 })
        .toArray();
      return docs.map(doc => this._mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Database query failed', error as Error);
    }
  }

  async updateLastMessage(id: string, lastMessage: string, lastMessageAt: Date): Promise<Conversation> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid ID format');
      }

      const result = await this._collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { lastMessage, lastMessageAt, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('Conversation not found');
      }

      return this._mapToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
      throw new InternalError('Failed to update last message', error as Error);
    }
  }
}
