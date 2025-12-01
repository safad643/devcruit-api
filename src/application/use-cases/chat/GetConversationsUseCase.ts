import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IGetConversationsUseCase } from './interfaces/IGetConversationsUseCase';
import { GetConversationsInput, GetConversationsOutput, ConversationListItem } from '../../dtos/chat.dto';

@injectable()
export class GetConversationsUseCase implements IGetConversationsUseCase {
  constructor(
    @inject(TYPES.ConversationRepository) private conversationRepository: IConversationRepository,
    @inject(TYPES.MessageRepository) private messageRepository: IMessageRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(input: GetConversationsInput): Promise<GetConversationsOutput> {
    const conversations = await this.conversationRepository.findByUserId(input.userId);

    const conversationListItems: ConversationListItem[] = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipantId = conversation.getOtherParticipantId(input.userId);
        const otherUser = await this.userRepository.findById(otherParticipantId);
        
        const unreadCount = await this.messageRepository.getUnreadCount(
          conversation.id,
          input.userId
        );

        return {
          id: conversation.id,
          otherParticipantId,
          otherParticipantName: otherUser?.name,
          otherParticipantEmail: otherUser?.email,
          lastMessage: conversation.lastMessage,
          lastMessageAt: conversation.lastMessageAt,
          unreadCount,
          companyId: conversation.companyId,
        };
      })
    );

    return {
      conversations: conversationListItems,
    };
  }
}

