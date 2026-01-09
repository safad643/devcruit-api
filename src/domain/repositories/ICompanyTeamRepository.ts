import { HRPermissions, HRProfile } from '../entities/HRProfile';
import { InterviewerAvailability, InterviewerProfile } from '../entities/InterviewerProfile';
import { CompanyTeamMemberStatus } from '../types';

export type CompanyTeamMember = HRProfile | InterviewerProfile;

export interface CompanyTeamMemberWithRole {
  member: CompanyTeamMember;
  role: 'hr' | 'interviewer';
}

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

export interface TeamStatsResult {
  total: number;
  hr: number;
  interviewers: number;
  active: number;
  invited: number;
}

export interface ListMembersOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedTeamMembersResult {
  data: CompanyTeamMemberWithRole[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICompanyTeamRepository {
  inviteMember(input: InviteCompanyTeamMemberInput): Promise<CompanyTeamMember>;
  listMembers(companyId: string, options?: ListMembersOptions): Promise<PaginatedTeamMembersResult>;
  findByEmail(companyId: string, email: string): Promise<CompanyTeamMember | null>;
  findByUserId(userId: string): Promise<CompanyTeamMember | null>;
  updateStatus(teamMemberId: string, status: CompanyTeamMemberStatus): Promise<void>;
  countActiveByCompany(companyId: string): Promise<number>;
  getTeamStats(companyId: string): Promise<TeamStatsResult>;
}
