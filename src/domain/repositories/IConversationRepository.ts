import { Conversation, ConversationProps } from '../entities/Conversation';
import { IGenericRepository } from './IGenericRepository';

export type CreateConversationProps = Omit<ConversationProps, 'id'>;
export type UpdateConversationProps = Partial<ConversationProps>;

export interface IConversationRepository extends IGenericRepository<Conversation, CreateConversationProps, UpdateConversationProps> {
  findByParticipants(participant1Id: string, participant2Id: string): Promise<Conversation | null>;
  findByUserId(userId: string): Promise<Conversation[]>;
  updateLastMessage(id: string, lastMessage: string, lastMessageAt: Date): Promise<Conversation>;
}
