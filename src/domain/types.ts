
export type UserRole = 'admin' | 'developer' | 'company' | 'hr' | 'interviewer';
export interface PendingUserData {
  email: string;
  name: string;
  password?: string; // hashed
  role: UserRole;
  invitedByCompanyId?: string;
  invitedByUserId?: string;
  invitationToken?: string;
}

export type CompanyTeamMemberStatus = 'invited' | 'active' | 'disabled';

export type OTPType = 'register' | 'reset';

export type FileCategory = 'PROFILE_PICTURE' | 'DEGREE_CERTIFICATE' | 'CV' | 'COMPANY_REGISTRATION_DOCUMENT' | 'COMPANY_VERIFICATION_DOCUMENT' | 'COMPANY_LOGO';

export type CompanyDocumentKey = 'COMPANY_REGISTRATION_DOCUMENT' | 'COMPANY_VERIFICATION_DOCUMENT';

