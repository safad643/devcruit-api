import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { IApplicationRepository } from '../../../domain/repositories/IApplicationRepository';
import { ICompanyTeamRepository } from '../../../domain/repositories/ICompanyTeamRepository';
import { IDeveloperProfileRepository } from '../../../domain/repositories/IDeveloperProfileRepository';
import { ICheckCanMessageUseCase } from './interfaces';
import { CheckCanMessageInput, CheckCanMessageOutput } from '../../dtos/chat.dto';

@injectable()
export class CheckCanMessageUseCase implements ICheckCanMessageUseCase {
  constructor(
    @inject(TYPES.ConversationRepository) private _conversationRepository: IConversationRepository,
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.CompanyTeamRepository) private _companyTeamRepository: ICompanyTeamRepository,
    @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository
  ) {}

  async execute(input: CheckCanMessageInput): Promise<CheckCanMessageOutput> {
    if (input.requesterRole === 'hr' || input.requesterRole === 'company') {
      return { canMessage: true };
    }

    if (input.requesterRole === 'developer') {
      const existingConversation = await this._conversationRepository.findByParticipants(
        input.requesterUserId,
        input.targetUserId
      );

      if (existingConversation) {
        return { canMessage: true };
      }

      const hrTeamMember = await this._companyTeamRepository.findByUserId(input.targetUserId);
      if (!hrTeamMember || hrTeamMember.status !== 'active') {
        return { canMessage: false };
      }

      const companyId = hrTeamMember.companyId;
      const developerProfile = await this._developerProfileRepository.findByUserId(input.requesterUserId);
      if (!developerProfile) {
        return { canMessage: false };
      }

      const applications = await this._applicationRepository.findByDeveloperId(developerProfile.id);

      const hasShortlistedApplication = applications.some(
        (app) =>
          app.companyId === companyId &&
          ['shortlisted', 'interviewing', 'offer_extended', 'offer_accepted', 'offer_declined'].includes(app.status) &&
          !['rejected', 'withdrawn'].includes(app.status)
      );

      return { canMessage: hasShortlistedApplication };
    }

    return { canMessage: false };
  }
}

