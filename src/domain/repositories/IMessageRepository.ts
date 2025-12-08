import { Message, MessageProps } from '../entities/Message';
import { IGenericRepository } from './IGenericRepository';

export interface MessageListFilters {
  conversationId: string;
  limit: number;
  beforeDate?: Date;
}

export interface MessageListResult {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

export type CreateMessageProps = Omit<MessageProps, 'id'>;
export type UpdateMessageProps = Partial<MessageProps>;

export interface IMessageRepository extends IGenericRepository<Message, CreateMessageProps, UpdateMessageProps> {
  findByConversationId(filters: MessageListFilters): Promise<MessageListResult>;
  markAsRead(messageIds: string[], conversationId: string, userId: string): Promise<void>;
  markConversationAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadCount(conversationId: string, userId: string): Promise<number>;
}
