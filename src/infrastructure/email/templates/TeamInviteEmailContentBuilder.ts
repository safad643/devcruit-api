import { EmailContent, IEmailContentBuilder } from './IEmailContentBuilder';

interface TeamInviteDetails {
    email: string;
    temporaryPassword: string;
    companyName: string;
    role: 'hr' | 'interviewer';
    loginUrl: string;
}

export class TeamInviteEmailContentBuilder implements IEmailContentBuilder {
    constructor(private readonly _details: TeamInviteDetails) { }

    build(): EmailContent {
        const { email, temporaryPassword, companyName, role, loginUrl } = this._details;
        const roleLabel = role === 'hr' ? 'HR Manager' : 'Interviewer';

        const subject = `You're invited to join ${companyName} on Devcruit`;
        const heading = `Welcome to ${companyName}`;

        const htmlContent = `
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666666;">
        You've been invited to join <strong>${companyName}</strong> as an <strong>${roleLabel}</strong> on Devcruit.
        <br><br>
        <strong>How to get started:</strong>
        <ol style="margin: 15px 0; padding-left: 20px; color: #333;">
          <li style="margin-bottom: 10px;">Go to the <a href="${loginUrl}" style="color: #667eea; text-decoration: none; font-weight: 600;">Devcruit Login page</a></li>
          <li style="margin-bottom: 10px;">Enter your email: <strong>${email}</strong></li>
          <li style="margin-bottom: 10px;">Enter the temporary password shown below</li>
          <li style="margin-bottom: 10px;">After logging in, you'll be able to change your password for security</li>
        </ol>
      </p>

      <div style="margin: 25px 0; padding: 25px; border-radius: 8px; background-color: #f4f6fb; border: 2px dashed #667eea; text-align: center;">
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Temporary Password</p>
        <p style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 3px; font-family: 'Courier New', monospace; color: #667eea;">${temporaryPassword}</p>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #999;">Keep this password secure and change it after first login</p>
      </div>

      <div style="text-align: center; margin-top: 25px;">
        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Go to Login Page</a>
      </div>

      <p style="font-size: 13px; color: #666; margin-top: 20px; text-align: center;">
        If you have any questions, please contact your company administrator.
      </p>
    `;

        const textContent = `You've been invited to join ${companyName} as an ${roleLabel} on Devcruit.

HOW TO LOG IN:
1. Go to: ${loginUrl}
2. Enter your email: ${email}
3. Enter your temporary password: ${temporaryPassword}
4. After logging in, change your password for security

Your temporary password: ${temporaryPassword}

If you have any questions, please contact your company administrator.`;

        return { subject, heading, htmlContent, textContent };
    }
}
