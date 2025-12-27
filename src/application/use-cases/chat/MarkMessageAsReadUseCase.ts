import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { IMarkMessageAsReadUseCase } from './interfaces';
import { MarkMessageAsReadInput, MarkMessageAsReadOutput } from '../../dtos/chat.dto';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';

@injectable()
export class MarkMessageAsReadUseCase implements IMarkMessageAsReadUseCase {
  constructor(
    @inject(TYPES.MessageRepository) private _messageRepository: IMessageRepository,
    @inject(TYPES.ConversationRepository) private _conversationRepository: IConversationRepository
  ) {}

  async execute(input: MarkMessageAsReadInput & { userId: string }): Promise<MarkMessageAsReadOutput> {
    const conversation = await this._conversationRepository.findById(input.conversationId);
    
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    if (!conversation.isParticipant(input.userId)) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    if (input.messageIds && input.messageIds.length > 0) {
      await this._messageRepository.markAsRead(input.messageIds, input.conversationId, input.userId);
    } else {
      await this._messageRepository.markConversationAsRead(input.conversationId, input.userId);
    }

    return {
      message: 'Messages marked as read',
    };
  }
}

