import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository, IJobRepository, ICompanyTeamRepository, IUserRepository, ICompanyProfileRepository, IDeveloperProfileRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { IScheduleInterviewRoundUseCase, ScheduleInterviewRoundInput, ScheduleInterviewRoundOutput } from './interfaces';
import { InterviewerProfile } from '../../../domain/entities/InterviewerProfile';
import { HRProfile } from '../../../domain/entities/HRProfile';
import { IEmailService } from '../../services';

@injectable()
export class ScheduleInterviewRoundUseCase implements IScheduleInterviewRoundUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.CompanyTeamRepository) private companyTeamRepository: ICompanyTeamRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.DeveloperProfileRepository) private developerProfileRepository: IDeveloperProfileRepository
  ) { }

  async execute(input: ScheduleInterviewRoundInput & { companyId: string }): Promise<ScheduleInterviewRoundOutput> {
    // 1. Get application
    const application = await this.applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // 2. Verify application belongs to company
    if (application.companyId !== input.companyId) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // 3. Verify application is shortlisted or interviewing
    if (application.status !== 'shortlisted' && application.status !== 'interviewing') {
      throw new ValidationError('Can only schedule interviews for shortlisted or interviewing applications');
    }

    // 4. Get job to verify round name exists
    const job = await this.jobRepository.findById(application.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (!job.interviewRounds.includes(input.roundName)) {
      throw new ValidationError(`Interview round "${input.roundName}" does not exist for this job`);
    }

    // 5. Validate interviewer belongs to the company (exactly one interviewer per round)
    if (!input.interviewerId) {
      throw new ValidationError('An interviewer must be selected');
    }

    const interviewerIds = [input.interviewerId];

    for (const interviewerId of interviewerIds) {
      // Allow assigning the company owner (CEO) directly using the company user ID
      if (interviewerId === input.companyId) {
        continue;
      }

      const teamMember = await this.companyTeamRepository.findByUserId(interviewerId);
      if (!teamMember || teamMember.companyId !== input.companyId) {
        throw new ValidationError(`Interviewer ${interviewerId} is not part of your company team`);
      }
      if (teamMember.status !== 'active') {
        throw new ValidationError(`Interviewer ${interviewerId} is not active`);
      }
      // Allow both Interviewer and HR accounts to be assigned
      if (!(teamMember instanceof InterviewerProfile) && !(teamMember instanceof HRProfile)) {
        throw new ValidationError('Only interviewer or HR accounts can be assigned to interview rounds');
      }
    }

    // 6. Parse scheduled date
    const scheduledAt = new Date(input.scheduledAt);
    if (isNaN(scheduledAt.getTime())) {
      throw new ValidationError('Invalid scheduled date');
    }
    if (scheduledAt < new Date()) {
      throw new ValidationError('Scheduled date must be in the future');
    }

    // 7. Check for scheduling conflicts
    const conflicts = await this.applicationRepository.findConflictingInterviews(input.interviewerId, scheduledAt);
    if (conflicts.length > 0) {
      // Format the scheduled time for display
      const timeStr = scheduledAt.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      throw new ValidationError(
        `This interviewer already has an interview scheduled around ${timeStr}. Please choose a different time or different interviewer.`
      );
    }

    // 8. Find or create the interview round
    const updatedRounds = [...application.interviewRounds];
    const roundIndex = updatedRounds.findIndex(r => r.roundName === input.roundName);

    if (roundIndex >= 0) {
      // Update existing round
      updatedRounds[roundIndex] = {
        ...updatedRounds[roundIndex],
        status: 'scheduled',
        scheduledAt,
        interviewerIds,
      };
    } else {
      // Create new round
      updatedRounds.push({
        roundName: input.roundName,
        status: 'scheduled',
        scheduledAt,
        interviewerIds,
      });
    }

    // 9. Update application status to 'interviewing' if not already
    const newStatus = application.status === 'shortlisted' ? 'interviewing' : application.status;

    // 10. Update application
    const updatedApplication = await this.applicationRepository.update(input.applicationId, {
      interviewRounds: updatedRounds,
      status: newStatus,
    });

    // 11. Send email notification to developer
    await this.sendInterviewScheduledEmail(
      application.developerId,
      input.companyId,
      input.interviewerId,
      job.title,
      input.roundName,
      scheduledAt,
      updatedRounds
    );

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      interviewRounds: updatedApplication.interviewRounds.map(round => ({
        roundName: round.roundName,
        status: round.status,
        scheduledAt: round.scheduledAt,
        interviewerIds: round.interviewerIds,
      })),
      message: `Interview round "${input.roundName}" scheduled successfully`,
    };
  }

  private async sendInterviewScheduledEmail(
    developerId: string,
    companyId: string,
    interviewerId: string,
    jobTitle: string,
    roundName: string,
    scheduledAt: Date,
    updatedRounds: Array<{ roundName: string; scheduledAt?: Date }>
  ): Promise<void> {
    try {
      // Get developer profile and user
      const developerProfile = await this.developerProfileRepository.findById(developerId);
      if (!developerProfile) return;

      const developerUser = await this.userRepository.findById(developerProfile.userId);
      if (!developerUser?.email) return;

      // Get company profile for company name
      const companyProfile = await this.companyProfileRepository.findByUserId(companyId);
      const companyName = companyProfile?.companyName || 'the company';

      // Get interviewer name
      let interviewerName = 'Interviewer';
      if (interviewerId === companyId) {
        // Company owner is the interviewer
        const companyUser = await this.userRepository.findById(companyId);
        interviewerName = companyUser?.name || companyProfile?.fullName || 'Company Representative';
      } else {
        // Team member is the interviewer
        const teamMember = await this.companyTeamRepository.findByUserId(interviewerId);
        if (teamMember instanceof InterviewerProfile || teamMember instanceof HRProfile) {
          interviewerName = teamMember.fullName || teamMember.email || 'Interviewer';
        }
      }

      // Get the scheduled date from the updated round
      const scheduledRound = updatedRounds.find(r => r.roundName === roundName);
      const scheduledDate = scheduledRound?.scheduledAt || scheduledAt;

      // Send email
      await this.emailService.sendInterviewScheduledNotification(
        developerUser.email,
        developerUser.name || 'Developer',
        companyName,
        jobTitle,
        roundName,
        scheduledDate,
        interviewerName
      );
    } catch (error) {
      // Log error but don't fail the interview scheduling
      console.error('Failed to send interview scheduled notification email:', error);
    }
  }
}

