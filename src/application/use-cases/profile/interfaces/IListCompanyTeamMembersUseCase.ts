import { CompanyTeamMemberStatus } from '../../../../domain/types';

export interface CompanyTeamMemberDTO {
  id: string;
  userId?: string | null;
  email: string;
  fullName?: string;
  role: 'hr' | 'interviewer';
  status: CompanyTeamMemberStatus;
  invitedAt: Date;
  activatedAt?: Date;
}

export interface IListCompanyTeamMembersUseCase {
  execute(companyUserId: string): Promise<CompanyTeamMemberDTO[]>;
}

