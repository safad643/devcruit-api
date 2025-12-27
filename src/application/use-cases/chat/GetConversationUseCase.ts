import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { IGetConversationUseCase } from './interfaces';
import { GetConversationInput, GetConversationOutput } from '../../dtos/chat.dto';
import { Conversation } from '../../../domain/entities/Conversation';

@injectable()
export class GetConversationUseCase implements IGetConversationUseCase {
  constructor(
    @inject(TYPES.ConversationRepository) private _conversationRepository: IConversationRepository
  ) {}

  async execute(input: GetConversationInput): Promise<GetConversationOutput> {
    let conversation = await this._conversationRepository.findByParticipants(
      input.participant1Id,
      input.participant2Id
    );

    let isNew = false;

    // If no conversation exists, create one
    if (!conversation) {
      const conversationData = Conversation.create({
        participant1Id: input.participant1Id,
        participant2Id: input.participant2Id,
        lastMessage: '',
        lastMessageAt: new Date(),
      });
      conversation = await this._conversationRepository.create(conversationData);
      isNew = true;
    }

    return {
      conversation,
      isNew,
    };
  }
}

