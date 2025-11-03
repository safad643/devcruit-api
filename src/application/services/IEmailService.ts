export interface IEmailService {
    sendOTP(email: string, otpCode: string, type: 'register' | 'reset'): Promise<void>;
    sendUserBlocked(email: string): Promise<void>;
    sendUserUnblocked(email: string): Promise<void>;

  }
  