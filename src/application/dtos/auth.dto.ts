import { UserRole, OTPType } from '../../domain/types';

export interface RegisterUserInput {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterUserOutput {
  message: string;
  email: string;
}

export interface VerifyEmailInput {
  email: string;
  otpCode: string;
}

export interface AuthTokensOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isProfileCompleted: boolean;
    status?: 'pending' | 'approved' | 'rejected' | 'resubmitted' | 'paid';
    neededDocuments?: Array<{
      documentKey: string;
      note?: string;
    }>;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResendOTPInput {
  email: string;
  type: OTPType; // 'register' or 'reset'
}

export interface ResendOTPOutput {
  message: string;
  email: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ForgotPasswordOutput {
  message: string;
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otpCode: string;
  newPassword: string;
}

export interface ResetPasswordOutput {
  message: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}


export interface LogoutInput {
  refreshToken: string;
}

export interface LogoutOutput {
  message: string;
}

export interface AdminAuthTokensOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: 'admin';
  };
}
