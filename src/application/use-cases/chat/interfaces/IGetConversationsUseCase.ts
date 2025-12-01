import { GetConversationsInput, GetConversationsOutput } from '../../../dtos/chat.dto';

export interface IGetConversationsUseCase {
  execute(input: GetConversationsInput): Promise<GetConversationsOutput>;
}

