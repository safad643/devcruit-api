import { GetConversationInput, GetConversationOutput } from '../../../dtos/chat.dto';

export interface IGetConversationUseCase {
  execute(input: GetConversationInput): Promise<GetConversationOutput>;
}

