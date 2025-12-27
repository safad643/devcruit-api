import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { ICompanyTeamRepository, ICompanyProfileRepository } from '../../../domain/repositories';
import { IValidateConversationParticipantUseCase } from './interfaces';
import { NotFoundError } from '../../../domain/errors';

@injectable()
export class ValidateConversationParticipantUseCase implements IValidateConversationParticipantUseCase {
  constructor(
    @inject(TYPES.ConversationRepository) private _conversationRepository: IConversationRepository,
    @inject(TYPES.CompanyTeamRepository) private _companyTeamRepository: ICompanyTeamRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository
  ) {}

  async execute(conversationId: string, requesterUserId: string, requesterRole: string): Promise<boolean> {
    const conversation = await this._conversationRepository.findById(conversationId);
    
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
      // Check if target user is a company user
      const companyProfile = await this._companyProfileRepository.findByUserId(targetUserId);
      if (companyProfile) {
        return true;
      }

      // Check if target user is an active HR team member
      const hrTeamMember = await this._companyTeamRepository.findByUserId(targetUserId);
      if (!hrTeamMember || hrTeamMember.status !== 'active') {
        return false;
      }

      return true;
    }

    return false;
  }
}

