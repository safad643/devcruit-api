export interface IEmailService {
  sendOTP(email: string, otpCode: string, type: 'register' | 'reset'): Promise<void>;
  sendUserBlocked(email: string): Promise<void>;
  sendUserUnblocked(email: string): Promise<void>;
  sendShortlistNotification(email: string, companyName: string, jobTitle: string): Promise<void>;
  sendRejectionNotification(email: string, companyName: string, jobTitle: string, rejectionNote?: string): Promise<void>;
  sendTeamInvite(email: string, temporaryPassword: string, companyName: string, role: 'hr' | 'interviewer'): Promise<void>;
  sendInterviewScheduledNotification(
    email: string,
    developerName: string,
    companyName: string,
    jobTitle: string,
    roundName: string,
    scheduledAt: Date,
    interviewerName: string
  ): Promise<void>;
  sendRescheduleRequestNotification(
    email: string,
    companyName: string,
    candidateName: string,
    jobTitle: string,
    roundName: string,
    currentScheduledAt: Date,
    reason?: string,
    proposedScheduledAt?: Date
  ): Promise<void>;
  sendInterviewRescheduledNotification(
    email: string,
    recipientName: string,
    companyName: string,
    jobTitle: string,
    roundName: string,
    oldScheduledAt: Date,
    newScheduledAt: Date,
    interviewerName: string
  ): Promise<void>;
  sendRescheduleRejectedNotification(
    email: string,
    candidateName: string,
    companyName: string,
    jobTitle: string,
    roundName: string,
    scheduledAt: Date,
    responseNote?: string
  ): Promise<void>;
}
