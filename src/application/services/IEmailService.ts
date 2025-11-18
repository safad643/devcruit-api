export interface IEmailService {
    sendOTP(email: string, otpCode: string, type: 'register' | 'reset'): Promise<void>;
    sendUserBlocked(email: string): Promise<void>;
    sendUserUnblocked(email: string): Promise<void>;
    sendShortlistNotification(email: string, companyName: string, jobTitle: string): Promise<void>;
    sendRejectionNotification(email: string, companyName: string, jobTitle: string, rejectionNote?: string): Promise<void>;
    sendTeamInvite(email: string, temporaryPassword: string, companyName: string, role: 'hr' | 'interviewer'): Promise<void>;
  }
  