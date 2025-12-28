import { EmailContent, IEmailContentBuilder } from './IEmailContentBuilder';

interface RescheduleRequestDetails {
    companyName: string;
    candidateName: string;
    jobTitle: string;
    roundName: string;
    currentScheduledAt: Date;
    reason?: string;
    proposedScheduledAt?: Date;
}

export class RescheduleRequestEmailContentBuilder implements IEmailContentBuilder {
    constructor(private readonly _details: RescheduleRequestDetails) { }

    build(): EmailContent {
        const { companyName, candidateName, jobTitle, roundName, currentScheduledAt, reason, proposedScheduledAt } = this._details;

        const formatDateTime = (date: Date) => {
            const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
            return `${date.toLocaleDateString('en-US', dateOptions)} at ${date.toLocaleTimeString('en-US', timeOptions)}`;
        };

        const currentTime = formatDateTime(new Date(currentScheduledAt));
        const proposedTime = proposedScheduledAt ? formatDateTime(new Date(proposedScheduledAt)) : null;

        const subject = '🔄 Reschedule Request - Devcruit';
        const heading = 'Interview Reschedule Request';

        const htmlContent = `
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666666;">
        Hi ${companyName} Team,
        <br><br>
        A candidate has requested to reschedule their interview.
        <br><br>
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #333333;">
            <strong>Candidate:</strong> ${candidateName}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #333333;">
            <strong>Position:</strong> ${jobTitle}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #333333;">
            <strong>Interview Round:</strong> ${roundName}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #333333;">
            <strong>Current Schedule:</strong> ${currentTime}
          </p>
          ${proposedTime ? `<p style="margin: 0 0 12px 0; font-size: 16px; color: #333333;"><strong>Proposed New Time:</strong> ${proposedTime}</p>` : ''}
          ${reason ? `<p style="margin: 0; font-size: 16px; color: #333333;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        <br>
        Please log in to your Devcruit dashboard to approve or reject this request.
        <br><br>
        Best regards,<br>
        The Devcruit Team
      </p>
    `;

        const textContent = `Hi ${companyName} Team,

A candidate has requested to reschedule their interview.

Candidate: ${candidateName}
Position: ${jobTitle}
Interview Round: ${roundName}
Current Schedule: ${currentTime}
${proposedTime ? `Proposed New Time: ${proposedTime}` : ''}
${reason ? `Reason: ${reason}` : ''}

Please log in to your Devcruit dashboard to approve or reject this request.

Best regards,
The Devcruit Team`;

        return { subject, heading, htmlContent, textContent };
    }
}
