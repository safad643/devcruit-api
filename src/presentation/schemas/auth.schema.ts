import { Type, Static } from '@sinclair/typebox';

// Register
export const RegisterUserSchema = Type.Object({
  email: Type.String({ format: 'email', minLength: 5, maxLength: 100 }),
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
  otpCode: Type.String({ pattern: '^[0-9]{6}$' })
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
  otpCode: Type.String({ pattern: '^[0-9]{6}$' }),
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

// Company Profile Resubmission Schema (all fields optional for partial updates)
export const CompanyProfileResubmissionSchema = Type.Object({
  fullName: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
  phoneNumber: Type.Optional(Type.String({ minLength: 1, maxLength: 20 })),
  companyName: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
  companyWebsite: Type.Optional(Type.String({ format: 'uri' })),
  companySize: Type.Optional(Type.Union([
    Type.Literal('1-10'),
    Type.Literal('11-50'),
    Type.Literal('51-200'),
    Type.Literal('201-500'),
    Type.Literal('501-1000'),
    Type.Literal('1000+')
  ])),
  businessRegistrationNumber: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  businessAddress: Type.Optional(Type.String({ minLength: 1, maxLength: 500 })),
  businessRegistrationProofUrl: Type.Optional(Type.String({ format: 'uri' })),
  employmentVerificationUrl: Type.Optional(Type.String({ format: 'uri' }))
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
export type CompanyProfileResubmissionInput = Static<typeof CompanyProfileResubmissionSchema>;  