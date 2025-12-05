import { EmailContent, IEmailContentBuilder } from './IEmailContentBuilder';
import { OTPType } from '../../../domain/types';

export class OTPEmailContentBuilder implements IEmailContentBuilder {
    constructor(
        private readonly otpCode: string,
        private readonly type: OTPType
    ) { }

    build(): EmailContent {
        const isRegistration = this.type === 'register';

        const subject = isRegistration
            ? '🔐 Verify Your Email - Devcruit'
            : '🔑 Password Reset Code - Devcruit';

        const heading = isRegistration
            ? 'Welcome to Devcruit!'
            : 'Password Reset Request';

        const message = isRegistration
            ? 'Thank you for signing up! To complete your registration and secure your account, please verify your email address using the code below:'
            : 'We received a request to reset your password. Use the verification code below to proceed with resetting your password:';

        const htmlContent = `
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666666;">
        ${message}
      </p>
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
        <tr>
          <td align="center" style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 2px dashed #667eea;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">Your verification code</p>
            <p class="otp-code" style="margin: 0; font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${this.otpCode}
            </p>
          </td>
        </tr>
      </table>
      
      <p style="margin: 20px 0 0 0; font-size: 14px; color: #999999; text-align: center;">
        ⏱️ This code expires in <strong>1 minute</strong>
      </p>
    `;

        const textContent = `${message}\n\nYour verification code: ${this.otpCode}\n\nThis code will expire in 1 minute.`;

        return { subject, heading, htmlContent, textContent };
    }
}
