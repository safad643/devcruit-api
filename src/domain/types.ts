
export type UserRole = 'admin' | 'developer' | 'company';
export interface PendingUserData {
  email: string;
  password: string; // hashed
  role: UserRole;
}

export type OTPType = 'register' | 'reset';

