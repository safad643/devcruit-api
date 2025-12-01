import { Conversation, ConversationProps } from '../entities/Conversation';

export interface IConversationRepository {
  create(conversation: Omit<ConversationProps, 'id'>): Promise<Conversation>;
  findById(id: string): Promise<Conversation | null>;
  findByParticipants(
    participant1Id: string,
    participant2Id: string
  ): Promise<Conversation | null>;
  findByUserId(userId: string): Promise<Conversation[]>;
  update(id: string, updates: Partial<ConversationProps>): Promise<Conversation>;
  updateLastMessage(
    id: string,
    lastMessage: string,
    lastMessageAt: Date
  ): Promise<Conversation>;
}

