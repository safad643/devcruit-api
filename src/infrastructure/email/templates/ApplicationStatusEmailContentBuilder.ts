import { EmailContent, IEmailContentBuilder } from './IEmailContentBuilder';

type ApplicationStatus = 'shortlisted' | 'rejected';

interface ApplicationDetails {
    companyName: string;
    jobTitle: string;
    rejectionNote?: string;
}

export class ApplicationStatusEmailContentBuilder implements IEmailContentBuilder {
    constructor(
        private readonly status: ApplicationStatus,
        private readonly details: ApplicationDetails
    ) { }

    build(): EmailContent {
        const { companyName, jobTitle, rejectionNote } = this.details;

        if (this.status === 'shortlisted') {
            return {
                subject: '🎉 Congratulations! You\'ve Been Shortlisted - Devcruit',
                heading: 'Application Shortlisted',
                htmlContent: `
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666666;">
            Great news! Your application has been shortlisted for the following position:
            <br><br>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #333333;">
                <strong>Company:</strong> ${companyName}
              </p>
              <p style="margin: 0; font-size: 16px; font-weight: 600; color: #333333;">
                <strong>Position:</strong> ${jobTitle}
              </p>
            </div>
            <br>
            The company will be in touch with you soon regarding the next steps in the interview process. 
            Please keep an eye on your email and application dashboard for updates.
            <br><br>
            We wish you the best of luck with your application!
          </p>
        `,
                textContent: `Congratulations! Your application has been shortlisted for the position "${jobTitle}" at ${companyName}. The company will be in touch with you soon regarding the next steps.`
            };
        } else {
            const rejectionNoteSection = rejectionNote
                ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #856404; text-transform: uppercase; letter-spacing: 0.5px;">
            Feedback from ${companyName}:
          </p>
          <p style="margin: 0; font-size: 15px; color: #856404; line-height: 1.5;">
            ${rejectionNote}
          </p>
        </div>
        `
                : '';

            const textNote = rejectionNote ? `\n\nFeedback from ${companyName}: ${rejectionNote}` : '';

            return {
                subject: 'Application Status Update - Devcruit',
                heading: 'Application Status Update',
                htmlContent: `
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666666;">
            Thank you for your interest in the position at ${companyName}. After careful consideration, we regret to inform you that your application for the following position has not been selected to move forward:
            <br><br>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #333333;">
                <strong>Company:</strong> ${companyName}
              </p>
              <p style="margin: 0; font-size: 16px; font-weight: 600; color: #333333;">
                <strong>Position:</strong> ${jobTitle}
              </p>
            </div>
            ${rejectionNoteSection}
            <br>
            We appreciate the time and effort you invested in your application. This decision does not reflect on your qualifications, and we encourage you to continue exploring other opportunities on our platform.
            <br><br>
            We wish you the best of luck in your job search!
          </p>
        `,
                textContent: `Thank you for your interest. After careful consideration, we regret to inform you that your application for the position "${jobTitle}" at ${companyName} has not been selected to move forward.${textNote}\n\nWe appreciate the time and effort you invested in your application and wish you the best of luck in your job search.`
            };
        }
    }
}
