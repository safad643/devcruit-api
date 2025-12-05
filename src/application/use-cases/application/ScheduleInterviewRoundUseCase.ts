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
  ) {}

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

    // 7. Find or create the interview round
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

    // 8. Update application status to 'interviewing' if not already
    const newStatus = application.status === 'shortlisted' ? 'interviewing' : application.status;

    // 9. Update application
    const updatedApplication = await this.applicationRepository.update(input.applicationId, {
      interviewRounds: updatedRounds,
      status: newStatus,
    });

    // 10. Send email notification to developer
    try {
      // Get developer profile and user
      const developerProfile = await this.developerProfileRepository.findById(application.developerId);
      if (developerProfile) {
        const developerUser = await this.userRepository.findById(developerProfile.userId);
        
        if (developerUser?.email) {
          // Get company profile for company name
          const companyProfile = await this.companyProfileRepository.findByUserId(input.companyId);
          const companyName = companyProfile?.companyName || 'the company';
          
          // Get interviewer name
          let interviewerName = 'Interviewer';
          if (input.interviewerId === input.companyId) {
            // Company owner is the interviewer
            const companyUser = await this.userRepository.findById(input.companyId);
            interviewerName = companyUser?.name || companyProfile?.fullName || 'Company Representative';
          } else {
            // Team member is the interviewer
            const teamMember = await this.companyTeamRepository.findByUserId(input.interviewerId);
            if (teamMember instanceof InterviewerProfile || teamMember instanceof HRProfile) {
              interviewerName = teamMember.fullName || teamMember.email || 'Interviewer';
            }
          }

          // Get the scheduled date from the updated round
          const scheduledRound = updatedRounds.find(r => r.roundName === input.roundName);
          const scheduledDate = scheduledRound?.scheduledAt || scheduledAt;

          // Send email
          await this.emailService.sendInterviewScheduledNotification(
            developerUser.email,
            developerUser.name || 'Developer',
            companyName,
            job.title,
            input.roundName,
            scheduledDate,
            interviewerName
          );
        }
      }
    } catch (error) {
      // Log error but don't fail the interview scheduling
      console.error('Failed to send interview scheduled notification email:', error);
    }

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
}

