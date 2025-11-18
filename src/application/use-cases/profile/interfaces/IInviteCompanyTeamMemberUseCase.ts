import { CompanyTeamMemberStatus } from '../../../../domain/types';

export interface CompanyTeamMemberDTO {
  id: string;
  email: string;
  fullName?: string;
  role: 'hr' | 'interviewer';
  status: CompanyTeamMemberStatus;
  invitedAt: Date;
  activatedAt?: Date;
}

export interface InviteCompanyTeamMemberInput {
  inviterUserId: string;
  email: string;
  role: 'hr' | 'interviewer';
  fullName?: string;
  jobTitle?: string;
}

export interface IInviteCompanyTeamMemberUseCase {
  execute(input: InviteCompanyTeamMemberInput): Promise<CompanyTeamMemberDTO>;
}

