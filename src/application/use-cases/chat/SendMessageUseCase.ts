import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { ICompanyTeamRepository } from '../../../domain/repositories/ICompanyTeamRepository';
import { ICheckCanMessageUseCase } from './interfaces/ICheckCanMessageUseCase';
import { ISendMessageUseCase } from './interfaces/ISendMessageUseCase';
import { SendMessageInput, SendMessageOutput } from '../../dtos/chat.dto';
import { ForbiddenError } from '../../../domain/errors';
import { Conversation } from '../../../domain/entities/Conversation';
import { Message } from '../../../domain/entities/Message';

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject(TYPES.ConversationRepository) private conversationRepository: IConversationRepository,
    @inject(TYPES.MessageRepository) private messageRepository: IMessageRepository,
    @inject(TYPES.CompanyTeamRepository) private companyTeamRepository: ICompanyTeamRepository,
    @inject(TYPES.CheckCanMessageUseCase) private checkCanMessageUseCase: ICheckCanMessageUseCase
  ) {}

  async execute(input: SendMessageInput & { senderId: string; senderRole: string }): Promise<SendMessageOutput> {
    const canMessage = await this.checkCanMessageUseCase.execute({
      requesterUserId: input.senderId,
      requesterRole: input.senderRole,
      targetUserId: input.receiverId,
    });

    if (!canMessage.canMessage) {
      throw new ForbiddenError('You are not authorized to message this user');
    }

    let conversation = await this.conversationRepository.findByParticipants(
      input.senderId,
      input.receiverId
    );

    if (!conversation) {
      let companyId: string | undefined;
      
      if (input.senderRole === 'developer') {
        const hrTeamMember = await this.companyTeamRepository.findByUserId(input.receiverId);
        if (hrTeamMember && hrTeamMember.status === 'active') {
          companyId = hrTeamMember.companyId;
        }
      } else if (input.senderRole === 'hr') {
        const hrTeamMember = await this.companyTeamRepository.findByUserId(input.senderId);
        if (hrTeamMember && hrTeamMember.status === 'active') {
          companyId = hrTeamMember.companyId;
        }
      }

      const conversationData = Conversation.create({
        participant1Id: input.senderId,
        participant2Id: input.receiverId,
        companyId,
      });
      conversation = await this.conversationRepository.create(conversationData);
    }

    const messageData = Message.create({
      conversationId: conversation.id,
      senderId: input.senderId,
      message: input.message,
    });

    const message = await this.messageRepository.create(messageData);

    await this.conversationRepository.updateLastMessage(
      conversation.id,
      input.message,
      new Date()
    );

    return {
      message,
      conversation,
    };
  }
}

