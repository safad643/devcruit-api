import {
    CheckCanMessageInput,
    CheckCanMessageOutput,
    GetConversationInput,
    GetConversationOutput,
    GetConversationsInput,
    GetConversationsOutput,
    GetMessagesInput,
    GetMessagesOutput,
    MarkMessageAsReadInput,
    MarkMessageAsReadOutput,
    SendMessageInput,
    SendMessageOutput,
} from '../../dtos/chat.dto';

export interface IGetConversationsUseCase {
    execute(input: GetConversationsInput): Promise<GetConversationsOutput>;
}

export interface IGetMessagesUseCase {
    execute(input: GetMessagesInput & { userId: string }): Promise<GetMessagesOutput>;
}

export interface IMarkMessageAsReadUseCase {
    execute(input: MarkMessageAsReadInput & { userId: string }): Promise<MarkMessageAsReadOutput>;
}

export interface ICheckCanMessageUseCase {
    execute(input: CheckCanMessageInput): Promise<CheckCanMessageOutput>;
}

export interface IGetConversationUseCase {
    execute(input: GetConversationInput): Promise<GetConversationOutput>;
}

export interface ISendMessageUseCase {
    execute(input: SendMessageInput & { senderId: string; senderRole: string }): Promise<SendMessageOutput>;
}

export interface IValidateConversationParticipantUseCase {
    execute(conversationId: string, requesterUserId: string, requesterRole: string): Promise<boolean>;
}
