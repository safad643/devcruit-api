import { GetMessagesInput, GetMessagesOutput } from '../../../dtos/chat.dto';

export interface IGetMessagesUseCase {
  execute(input: GetMessagesInput & { userId: string }): Promise<GetMessagesOutput>;
}

