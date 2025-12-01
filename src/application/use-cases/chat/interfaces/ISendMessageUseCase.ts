import { SendMessageInput, SendMessageOutput } from '../../../dtos/chat.dto';

export interface ISendMessageUseCase {
  execute(input: SendMessageInput & { senderId: string; senderRole: string }): Promise<SendMessageOutput>;
}

