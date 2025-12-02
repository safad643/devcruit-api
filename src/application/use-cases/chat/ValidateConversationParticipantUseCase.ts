import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { ICompanyTeamRepository } from '../../../domain/repositories/ICompanyTeamRepository';
import { IValidateConversationParticipantUseCase } from './interfaces/IValidateConversationParticipantUseCase';
import { NotFoundError } from '../../../domain/errors';

@injectable()
export class ValidateConversationParticipantUseCase implements IValidateConversationParticipantUseCase {
  constructor(
    @inject(TYPES.ConversationRepository) private conversationRepository: IConversationRepository,
    @inject(TYPES.CompanyTeamRepository) private companyTeamRepository: ICompanyTeamRepository
  ) {}

  async execute(conversationId: string, requesterUserId: string, requesterRole: string): Promise<boolean> {
    const conversation = await this.conversationRepository.findById(conversationId);
    
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    if (!conversation.isParticipant(requesterUserId)) {
      return false;
    }

    const targetUserId = conversation.getOtherParticipantId(requesterUserId);

    if (requesterRole === 'hr' || requesterRole === 'company') {
      return true;
    }

    if (requesterRole === 'developer') {
      const hrTeamMember = await this.companyTeamRepository.findByUserId(targetUserId);
      if (!hrTeamMember || hrTeamMember.status !== 'active') {
        return false;
      }

      return true;
    }

    return false;
  }
}

