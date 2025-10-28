
export type UserRole = 'admin' | 'developer' | 'company';
export interface PendingUserData {
  email: string;
  password: string; // hashed
  role: UserRole;
}

export type OTPType = 'register' | 'reset';

export type FileCategory = 'PROFILE_PICTURE' | 'DEGREE_CERTIFICATE' | 'CV' | 'COMPANY_REGISTRATION_DOCUMENT' | 'COMPANY_VERIFICATION_DOCUMENT';

