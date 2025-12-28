import { EmailContent, IEmailContentBuilder } from './IEmailContentBuilder';

interface RescheduleRejectedDetails {
    candidateName: string;
    companyName: string;
    jobTitle: string;
    roundName: string;
    scheduledAt: Date;
    responseNote?: string;
}

export class RescheduleRejectedEmailContentBuilder implements IEmailContentBuilder {
    constructor(private readonly _details: RescheduleRejectedDetails) { }

    build(): EmailContent {
        const { candidateName, companyName, jobTitle, roundName, scheduledAt, responseNote } = this._details;

        const formatDateTime = (date: Date) => {
            const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
            return `${date.toLocaleDateString('en-US', dateOptions)} at ${date.toLocaleTimeString('en-US', timeOptions)}`;
        };

        const formattedTime = formatDateTime(new Date(scheduledAt));

        const subject = '📅 Reschedule Request Update - Devcruit';
        const heading = 'Reschedule Request Not Approved';

        const htmlContent = `
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666666;">
        Hi ${candidateName},
        <br><br>
        Unfortunately, your request to reschedule the interview could not be accommodated at this time.
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
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #333333;">
            <strong>Scheduled Time:</strong> ${formattedTime}
          </p>
          ${responseNote ? `<p style="margin: 12px 0 0 0; font-size: 16px; color: #666666;"><strong>Note from company:</strong> ${responseNote}</p>` : ''}
        </div>
        <br>
        Please ensure you are available at the originally scheduled time.
        <br><br>
        Best regards,<br>
        The Devcruit Team
      </p>
    `;

        const textContent = `Hi ${candidateName},

Unfortunately, your request to reschedule the interview could not be accommodated at this time.

Company: ${companyName}
Position: ${jobTitle}
Interview Round: ${roundName}
Scheduled Time: ${formattedTime}
${responseNote ? `Note from company: ${responseNote}` : ''}

Please ensure you are available at the originally scheduled time.

Best regards,
The Devcruit Team`;

        return { subject, heading, htmlContent, textContent };
    }
}
