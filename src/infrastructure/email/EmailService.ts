import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { IEmailService } from '../../application/services';
import { config } from '../../config';
import { InternalError } from '../../domain/errors';
import { injectable } from 'inversify';
import { OTPType } from '../../domain/types';
import { EmailTemplate } from './EmailTemplate';
import { OTPEmailContentBuilder } from './templates/OTPEmailContentBuilder';
import { AccountStatusEmailContentBuilder } from './templates/AccountStatusEmailContentBuilder';
import { ApplicationStatusEmailContentBuilder } from './templates/ApplicationStatusEmailContentBuilder';
import { TeamInviteEmailContentBuilder } from './templates/TeamInviteEmailContentBuilder';
import { InterviewScheduledEmailContentBuilder } from './templates/InterviewScheduledEmailContentBuilder';
import { IEmailContentBuilder } from './templates/IEmailContentBuilder';

@injectable()
export class EmailService implements IEmailService {
  private _transporter: Transporter;

  constructor() {
    this._transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  private async _sendEmail(to: string, contentBuilder: IEmailContentBuilder): Promise<void> {
    try {
      const { subject, heading, htmlContent, textContent } = contentBuilder.build();
      const html = EmailTemplate.build(subject, heading, htmlContent);

      await this._transporter.sendMail({
        from: `"Devcruit" <${config.email.from}>`,
        to,
        subject,
        text: textContent,
        html,
      });
    } catch (error) {
      throw new InternalError('Failed to send email', error as Error);
    }
  }

  async sendOTP(email: string, otpCode: string, type: OTPType): Promise<void> {
    await this._sendEmail(email, new OTPEmailContentBuilder(otpCode, type));
  }

  async sendUserBlocked(email: string): Promise<void> {
    try {
      await this._sendEmail(email, new AccountStatusEmailContentBuilder('blocked'));
    } catch (error) {
      console.error('Failed to send block email to', email, error);
      // Silently fail - don't throw
    }
  }

  async sendUserUnblocked(email: string): Promise<void> {
    try {
      await this._sendEmail(email, new AccountStatusEmailContentBuilder('unblocked'));
    } catch (error) {
      console.error('Failed to send unblock email to', email, error);
      // Silently fail - don't throw
    }
  }

  async sendShortlistNotification(email: string, companyName: string, jobTitle: string): Promise<void> {
    try {
      await this._sendEmail(
        email,
        new ApplicationStatusEmailContentBuilder('shortlisted', { companyName, jobTitle })
      );
    } catch (error) {
      console.error('Failed to send shortlist notification email to', email, error);
      // Silently fail - don't throw to avoid breaking the application flow
    }
  }

  async sendRejectionNotification(email: string, companyName: string, jobTitle: string, rejectionNote?: string): Promise<void> {
    try {
      await this._sendEmail(
        email,
        new ApplicationStatusEmailContentBuilder('rejected', { companyName, jobTitle, rejectionNote })
      );
    } catch (error) {
      console.error('Failed to send rejection notification email to', email, error);
      // Silently fail - don't throw to avoid breaking the application flow
    }
  }

  async sendTeamInvite(email: string, temporaryPassword: string, companyName: string, role: 'hr' | 'interviewer'): Promise<void> {
    try {
      await this._sendEmail(
        email,
        new TeamInviteEmailContentBuilder({
          email,
          temporaryPassword,
          companyName,
          role,
          loginUrl: `${config.webApp.url}/login`
        })
      );
    } catch (error) {
      console.error('Failed to send team invite email to', email, error);
    }
  }

  async sendInterviewScheduledNotification(
    email: string,
    developerName: string,
    companyName: string,
    jobTitle: string,
    roundName: string,
    scheduledAt: Date,
    interviewerName: string
  ): Promise<void> {
    try {
      await this._sendEmail(
        email,
        new InterviewScheduledEmailContentBuilder({
          developerName,
          companyName,
          jobTitle,
          roundName,
          scheduledAt,
          interviewerName
        })
      );
    } catch (error) {
      console.error('Failed to send interview scheduled notification email to', email, error);
      // Silently fail - don't throw to avoid breaking the interview scheduling flow
    }
  }
}
