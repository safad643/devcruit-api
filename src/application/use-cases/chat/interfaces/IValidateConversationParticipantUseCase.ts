export interface IValidateConversationParticipantUseCase {
  execute(conversationId: string, requesterUserId: string, requesterRole: string): Promise<boolean>;
}

