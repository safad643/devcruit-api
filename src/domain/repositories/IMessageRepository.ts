import { Message, MessageProps } from '../entities/Message';

export interface MessageListFilters {
  conversationId: string;
  limit: number;
  beforeDate?: Date; // For cursor-based pagination - get messages before this date
}

export interface MessageListResult {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

export interface IMessageRepository {
  create(message: Omit<MessageProps, 'id'>): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  findByConversationId(filters: MessageListFilters): Promise<MessageListResult>;
  markAsRead(messageIds: string[], conversationId: string, userId: string): Promise<void>;
  markConversationAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadCount(conversationId: string, userId: string): Promise<number>;
}

