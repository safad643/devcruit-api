import { Type, Static } from '@sinclair/typebox';
import { config } from '../../config';

// Helper function to generate OTP pattern based on configured length
function getOTPPattern(): string {
  return `^[0-9]{${config.otp.length}}$`;
}

// Register
export const RegisterUserSchema = Type.Object({
  email: Type.String({ format: 'email', minLength: 5, maxLength: 100 }),
  name: Type.String({ minLength: 1, maxLength: 100 }),
  password: Type.String({ 
    minLength: 6, 
    maxLength: 100,
    pattern: '^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$'
  }),
  role: Type.Union([
    Type.Literal('developer'),
    Type.Literal('company'),
    Type.Literal('admin')
  ])
});

// Verify Email
export const VerifyEmailSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  otpCode: Type.String({ pattern: getOTPPattern() })
});

// Login
export const LoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 1 })
});

// Resend OTP
export const ResendOTPSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  type: Type.Union([
    Type.Literal('register'),
    Type.Literal('reset')
  ])
});

// Forgot Password
export const ForgotPasswordSchema = Type.Object({
  email: Type.String({ format: 'email' })
});

// Reset Password
export const ResetPasswordSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  otpCode: Type.String({ pattern: getOTPPattern() }),
  newPassword: Type.String({ 
    minLength: 6, 
    maxLength: 100,
    pattern: '^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$'
  })
});


// Google Login
export const GoogleLoginSchema = Type.Object({
  code: Type.String({ minLength: 1 })
});

// Google Register
export const GoogleRegisterSchema = Type.Object({
  code: Type.String({ minLength: 1 }),
  role: Type.Union([
    Type.Literal('developer'),
    Type.Literal('company')
  ])
});

// Export TypeScript types
export type RegisterUserInput = Static<typeof RegisterUserSchema>;
export type VerifyEmailInput = Static<typeof VerifyEmailSchema>;
export type LoginInput = Static<typeof LoginSchema>;
export type ResendOTPInput = Static<typeof ResendOTPSchema>;
export type ForgotPasswordInput = Static<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = Static<typeof ResetPasswordSchema>;

export type GoogleLoginInput = Static<typeof GoogleLoginSchema>;
export type GoogleRegisterInput = Static<typeof GoogleRegisterSchema>;  