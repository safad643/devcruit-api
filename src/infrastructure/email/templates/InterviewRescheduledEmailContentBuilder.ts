import { EmailContent, IEmailContentBuilder } from './IEmailContentBuilder';

interface InterviewRescheduledDetails {
    recipientName: string;
    companyName: string;
    jobTitle: string;
    roundName: string;
    oldScheduledAt: Date;
    newScheduledAt: Date;
    interviewerName: string;
}

export class InterviewRescheduledEmailContentBuilder implements IEmailContentBuilder {
    constructor(private readonly _details: InterviewRescheduledDetails) { }

    build(): EmailContent {
        const { recipientName, companyName, jobTitle, roundName, oldScheduledAt, newScheduledAt, interviewerName } = this._details;

        const formatDateTime = (date: Date) => {
            const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
            return `${date.toLocaleDateString('en-US', dateOptions)} at ${date.toLocaleTimeString('en-US', timeOptions)}`;
        };

        const oldTime = formatDateTime(new Date(oldScheduledAt));
        const newTime = formatDateTime(new Date(newScheduledAt));

        const subject = '📅 Interview Rescheduled - Devcruit';
        const heading = 'Interview Has Been Rescheduled';

        const htmlContent = `
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666666;">
        Hi ${recipientName},
        <br><br>
        Your interview has been rescheduled. Please note the new date and time below.
        <br><br>
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #333333;">
            <strong>Company:</strong> ${companyName}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #333333;">
            <strong>Position:</strong> ${jobTitle}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #333333;">
            <strong>Interview Round:</strong> ${roundName}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #333333;">
            <strong>Interviewer:</strong> ${interviewerName}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #999999; text-decoration: line-through;">
            <strong>Previous Time:</strong> ${oldTime}
          </p>
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #28a745;">
            <strong>New Time:</strong> ${newTime}
          </p>
        </div>
        <br>
        Please update your calendar accordingly.
        <br><br>
        Best regards,<br>
        The Devcruit Team
      </p>
    `;

        const textContent = `Hi ${recipientName},

Your interview has been rescheduled. Please note the new date and time below.

Company: ${companyName}
Position: ${jobTitle}
Interview Round: ${roundName}
Interviewer: ${interviewerName}
Previous Time: ${oldTime}
New Time: ${newTime}

Please update your calendar accordingly.

Best regards,
The Devcruit Team`;

        return { subject, heading, htmlContent, textContent };
    }
}
