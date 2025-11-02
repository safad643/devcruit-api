export interface IEmailService {
    sendOTP(email: string, otpCode: string, type: 'register' | 'reset'): Promise<void>;
  }
  