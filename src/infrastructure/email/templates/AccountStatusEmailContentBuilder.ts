import { EmailContent, IEmailContentBuilder } from './IEmailContentBuilder';

type AccountStatus = 'blocked' | 'unblocked';

export class AccountStatusEmailContentBuilder implements IEmailContentBuilder {
    constructor(private readonly status: AccountStatus) { }

    build(): EmailContent {
        if (this.status === 'blocked') {
            return {
                subject: '⚠️ Account Status Update - Devcruit',
                heading: 'Account Access Suspended',
                htmlContent: `
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666666;">
            Your Devcruit account has been temporarily suspended by our administration team.
            <br><br>
            If you believe this action was taken in error or would like to discuss this matter, 
            please reach out to our support team at <a href="mailto:support@devcruit.com" style="color: #667eea; text-decoration: none;">support@devcruit.com</a>.
            <br><br>
            We're here to help resolve any issues.
          </p>
        `,
                textContent: 'Your account has been blocked by the administrator. If you believe this is a mistake, please contact support at support@devcruit.com'
            };
        } else {
            return {
                subject: '✅ Account Access Restored - Devcruit',
                heading: 'Your Account Has Been Reactivated',
                htmlContent: `
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666666;">
            Good news! Your Devcruit account has been unblocked and you now have full access again.
            <br><br>
            You can log in and resume using all features immediately. If you experience any issues 
            or have questions, please contact our support team at 
            <a href="mailto:support@devcruit.com" style="color: #667eea; text-decoration: none;">support@devcruit.com</a>.
            <br><br>
            Thank you for your patience.
          </p>
        `,
                textContent: 'Your account has been unblocked. You can now log in and access all features. Contact support@devcruit.com if you need assistance.'
            };
        }
    }
}
