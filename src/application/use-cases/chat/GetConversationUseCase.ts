import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { IGetConversationUseCase } from './interfaces/IGetConversationUseCase';
import { GetConversationInput, GetConversationOutput } from '../../dtos/chat.dto';

@injectable()
export class GetConversationUseCase implements IGetConversationUseCase {
  constructor(
    @inject(TYPES.ConversationRepository) private conversationRepository: IConversationRepository
  ) {}

  async execute(input: GetConversationInput): Promise<GetConversationOutput> {
    const conversation = await this.conversationRepository.findByParticipants(
      input.participant1Id,
      input.participant2Id
    );

    return {
      conversation,
    };
  }
}

