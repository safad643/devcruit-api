import { HRPermissions, HRProfile } from '../entities/HRProfile';
import { InterviewerAvailability, InterviewerProfile } from '../entities/InterviewerProfile';
import { CompanyTeamMemberStatus } from '../types';

export type CompanyTeamMember = HRProfile | InterviewerProfile;

export interface InviteCompanyTeamMemberInput {
  companyId: string;
  email: string;
  fullName?: string;
  role: 'hr' | 'interviewer';
  invitedBy: string;
  userId?: string | null;
  jobTitle?: string;
  phoneNumber?: string;
  hrPermissions?: HRPermissions;
  interviewerFocusAreas?: string[];
  interviewerAvailability?: InterviewerAvailability;
}

export interface ICompanyTeamRepository {
  inviteMember(input: InviteCompanyTeamMemberInput): Promise<CompanyTeamMember>;
  listMembers(companyId: string): Promise<CompanyTeamMember[]>;
  findByEmail(companyId: string, email: string): Promise<CompanyTeamMember | null>;
  findByUserId(userId: string): Promise<CompanyTeamMember | null>;
  updateStatus(teamMemberId: string, status: CompanyTeamMemberStatus): Promise<void>;
}

