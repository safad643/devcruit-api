import { Conversation } from '../../domain/entities/Conversation';
import { Message } from '../../domain/entities/Message';

export interface SendMessageInput {
  receiverId: string;
  message: string;
}

export interface SendMessageOutput {
  message: Message;
  conversation: Conversation;
}

export interface GetConversationsInput {
  userId: string;
}

export interface ConversationListItem {
  id: string;
  otherParticipantId: string;
  otherParticipantName?: string;
  otherParticipantEmail?: string;
  lastMessage?: string;
  lastMessageAt: Date;
  unreadCount: number;
  companyId?: string;
}

export interface GetConversationsOutput {
  conversations: ConversationListItem[];
}

export interface GetMessagesInput {
  conversationId: string;
  limit: number;
  beforeDate?: Date;
}

export interface GetMessagesOutput {
  messages: Message[];
  hasMore: boolean;
  total: number;
}

export interface MarkMessageAsReadInput {
  conversationId: string;
  messageIds?: string[];
}

export interface MarkMessageAsReadOutput {
  message: string;
}

export interface CheckCanMessageInput {
  requesterUserId: string;
  requesterRole: string;
  targetUserId: string;
}

export interface CheckCanMessageOutput {
  canMessage: boolean;
}

export interface GetConversationInput {
  participant1Id: string;
  participant2Id: string;
}

export interface GetConversationOutput {
  conversation: Conversation;
  isNew: boolean;
}

