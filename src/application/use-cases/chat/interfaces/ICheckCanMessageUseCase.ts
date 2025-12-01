import { CheckCanMessageInput, CheckCanMessageOutput } from '../../../dtos/chat.dto';

export interface ICheckCanMessageUseCase {
  execute(input: CheckCanMessageInput): Promise<CheckCanMessageOutput>;
}

