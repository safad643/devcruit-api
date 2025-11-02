import nodemailer, { Transporter } from 'nodemailer';
import { IEmailService } from '../../application/services';
import { config } from '../../config';
import { InternalError } from '../../domain/errors';
import { injectable } from 'inversify';
import { OTPType } from '../../domain/types';
@injectable()
export class EmailService implements IEmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendOTP(email: string, otpCode: string, type:OTPType): Promise<void> {
    try {
      const subject = type === 'register' 
        ? 'Verify Your Email - Devcruit' 
        : 'Password Reset Code - Devcruit';

      const message = type === 'register'
        ? `Your verification code is: ${otpCode}\n\nThis code will expire in 1 minute.`
        : `Your password reset code is: ${otpCode}\n\nThis code will expire in 1 minute.`;

      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject,
        text: message,
      });
    } catch (error) {
      throw new InternalError('Failed to send email', error as Error);
    }
  }
}

