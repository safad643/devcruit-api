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

  private getEmailTemplate(
    title: string,
    heading: string,
    message: string,
    otpCode?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @media screen and (max-width: 600px) {
            .content {
              width: 100% !important;
              padding: 10px !important;
            }
            .header, .body, .footer {
              padding: 20px !important;
            }
            .otp-code {
              font-size: 28px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table class="content" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td class="header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Devcruit</h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td class="body" style="padding: 40px; color: #333333;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">${heading}</h2>
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666666;">
                      ${message}
                    </p>
                    
                    ${
                      otpCode
                        ? `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center" style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 2px dashed #667eea;">
                          <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">Your verification code</p>
                          <p class="otp-code" style="margin: 0; font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${otpCode}
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0 0 0; font-size: 14px; color: #999999; text-align: center;">
                      ⏱️ This code expires in <strong>1 minute</strong>
                    </p>
                    `
                        : ''
                    }
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td class="footer" style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                      This is an automated message, please do not reply.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      © ${new Date().getFullYear()} Devcruit. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async sendOTP(email: string, otpCode: string, type: OTPType): Promise<void> {
    try {
      const isRegistration = type === 'register';
      
      const subject = isRegistration 
        ? '🔐 Verify Your Email - Devcruit' 
        : '🔑 Password Reset Code - Devcruit';

      const heading = isRegistration 
        ? 'Welcome to Devcruit!' 
        : 'Password Reset Request';

      const message = isRegistration
        ? 'Thank you for signing up! To complete your registration and secure your account, please verify your email address using the code below:'
        : 'We received a request to reset your password. Use the verification code below to proceed with resetting your password:';

      const html = this.getEmailTemplate(subject, heading, message, otpCode);

      await this.transporter.sendMail({
        from: `"Devcruit" <${config.email.from}>`,
        to: email,
        subject,
        text: `${message}\n\nYour verification code: ${otpCode}\n\nThis code will expire in 1 minute.`,
        html,
      });
    } catch (error) {
      throw new InternalError('Failed to send email', error as Error);
    }
  }

  async sendUserBlocked(email: string): Promise<void> {
    try {
      const subject = '⚠️ Account Status Update - Devcruit';
      const heading = 'Account Access Suspended';
      const message = `
        Your Devcruit account has been temporarily suspended by our administration team.
        <br><br>
        If you believe this action was taken in error or would like to discuss this matter, 
        please reach out to our support team at <a href="mailto:support@devcruit.com" style="color: #667eea; text-decoration: none;">support@devcruit.com</a>.
        <br><br>
        We're here to help resolve any issues.
      `;
  
      const html = this.getEmailTemplate(subject, heading, message);
  
      await this.transporter.sendMail({
        from: `"Devcruit" <${config.email.from}>`,
        to: email,
        subject,
        text: 'Your account has been blocked by the administrator. If you believe this is a mistake, please contact support at support@devcruit.com',
        html,
      });
    } catch (error) {
      console.error('Failed to send block email to', email, error);
      // Silently fail - don't throw
    }
  }
  
  async sendUserUnblocked(email: string): Promise<void> {
    try {
      const subject = '✅ Account Access Restored - Devcruit';
      const heading = 'Your Account Has Been Reactivated';
      const message = `
        Good news! Your Devcruit account has been unblocked and you now have full access again.
        <br><br>
        You can log in and resume using all features immediately. If you experience any issues 
        or have questions, please contact our support team at 
        <a href="mailto:support@devcruit.com" style="color: #667eea; text-decoration: none;">support@devcruit.com</a>.
        <br><br>
        Thank you for your patience.
      `;
  
      const html = this.getEmailTemplate(subject, heading, message);
  
      await this.transporter.sendMail({
        from: `"Devcruit" <${config.email.from}>`,
        to: email,
        subject,
        text: 'Your account has been unblocked. You can now log in and access all features. Contact support@devcruit.com if you need assistance.',
        html,
      });
    } catch (error) {
      console.error('Failed to send unblock email to', email, error);
      // Silently fail - don't throw
    }
  }
  
  
}
