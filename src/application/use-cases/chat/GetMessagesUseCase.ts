import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { IGetMessagesUseCase } from './interfaces';
import { GetMessagesInput, GetMessagesOutput } from '../../dtos/chat.dto';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';

@injectable()
export class GetMessagesUseCase implements IGetMessagesUseCase {
  constructor(
    @inject(TYPES.MessageRepository) private _messageRepository: IMessageRepository,
    @inject(TYPES.ConversationRepository) private _conversationRepository: IConversationRepository
  ) {}

  async execute(input: GetMessagesInput & { userId: string }): Promise<GetMessagesOutput> {
    const conversation = await this._conversationRepository.findById(input.conversationId);
    
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    if (!conversation.isParticipant(input.userId)) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    const result = await this._messageRepository.findByConversationId({
      conversationId: input.conversationId,
      limit: input.limit,
      beforeDate: input.beforeDate,
    });

    return {
      messages: result.messages,
      hasMore: result.hasMore,
      total: result.total,
    };
  }
}

