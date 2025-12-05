import { EmailContent, IEmailContentBuilder } from './IEmailContentBuilder';

interface InterviewDetails {
    developerName: string;
    companyName: string;
    jobTitle: string;
    roundName: string;
    scheduledAt: Date;
    interviewerName: string;
}

export class InterviewScheduledEmailContentBuilder implements IEmailContentBuilder {
    constructor(private readonly details: InterviewDetails) { }

    build(): EmailContent {
        const { developerName, companyName, jobTitle, roundName, scheduledAt, interviewerName } = this.details;

        // Format the scheduled date and time
        const scheduledDate = new Date(scheduledAt);
        const dateOptions: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        const formattedDate = scheduledDate.toLocaleDateString('en-US', dateOptions);
        const formattedTime = scheduledDate.toLocaleTimeString('en-US', timeOptions);
        const formattedDateTime = `${formattedDate} at ${formattedTime}`;

        const subject = '📅 Interview Scheduled - Devcruit';
        const heading = 'Interview Scheduled Successfully';

        const htmlContent = `
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666666;">
        Hi ${developerName},
        <br><br>
        Great news! An interview has been scheduled for your application. We're excited to move forward with your candidacy.
        <br><br>
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #333333;">
            <strong>Company:</strong> ${companyName}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #333333;">
            <strong>Position:</strong> ${jobTitle}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #333333;">
            <strong>Interview Round:</strong> ${roundName}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #333333;">
            <strong>Interviewer:</strong> ${interviewerName}
          </p>
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #333333;">
            <strong>Date & Time:</strong> ${formattedDateTime}
          </p>
        </div>
        <br>
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 15px; font-weight: 600; color: #856404;">
            📌 Important Reminders:
          </p>
          <ul style="margin: 10px 0; padding-left: 20px; color: #856404; line-height: 1.8;">
            <li>Please mark this date and time in your calendar</li>
            <li>Ensure you have a stable internet connection if it's a virtual interview</li>
            <li>Review the job description and prepare questions about the role</li>
            <li>Be ready 5-10 minutes before the scheduled time</li>
          </ul>
        </div>
        <br>
        You can view all your interview details and manage your applications by logging into your Devcruit dashboard.
        <br><br>
        We wish you the best of luck with your interview! If you have any questions or need to reschedule, please contact ${companyName} directly.
        <br><br>
        Best regards,<br>
        The Devcruit Team
      </p>
    `;

        const textContent = `Hi ${developerName},

Great news! An interview has been scheduled for your application.

Company: ${companyName}
Position: ${jobTitle}
Interview Round: ${roundName}
Interviewer: ${interviewerName}
Date & Time: ${formattedDateTime}

Important Reminders:
- Please mark this date and time in your calendar
- Ensure you have a stable internet connection if it's a virtual interview
- Review the job description and prepare questions about the role
- Be ready 5-10 minutes before the scheduled time

You can view all your interview details and manage your applications by logging into your Devcruit dashboard.

We wish you the best of luck with your interview! If you have any questions or need to reschedule, please contact ${companyName} directly.

Best regards,
The Devcruit Team`;

        return { subject, heading, htmlContent, textContent };
    }
}
