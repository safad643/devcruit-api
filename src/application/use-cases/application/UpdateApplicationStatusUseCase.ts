import { 
  IApplicationRepository, 
  IJobRepository,
  IDeveloperProfileRepository,
  ICompanyProfileRepository,
  IUserRepository
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { ApplicationStatus } from '../../../domain/entities/Application';
import { UpdateApplicationStatusInput, UpdateApplicationStatusOutput } from '../../dtos/application.dto';
import { IEmailService } from '../../services';

@injectable()
export class UpdateApplicationStatusUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService
  ) {}

  async execute(input: UpdateApplicationStatusInput & { companyId: string }): Promise<UpdateApplicationStatusOutput> {
    // 1. Get application
    const application = await this.applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // 2. Verify the application belongs to the company
    if (application.companyId !== input.companyId) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // 3. Get the job to access interviewRounds
    const job = await this.jobRepository.findById(application.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // 4. Validate status transition
    this.validateStatusTransition(application.status, input.status, job.interviewRounds, application.interviewRounds);

    // 5. Prepare update data
    const updateData: any = {
      status: input.status,
      lastUpdatedAt: new Date(),
    };

    // 6. If status is shortlisted and not already set, set shortlistMethod to manual
    if (input.status === 'shortlisted' && !application.shortlistMethod) {
      updateData.shortlistMethod = 'manual';
    }

    // 7. If status is rejected, set rejectedAt and rejectedAtStage
    if (input.status === 'rejected') {
      updateData.rejectedAt = new Date();
      updateData.rejectedAtStage = application.status;
      if (input.rejectionReason) {
        updateData.rejectionReason = input.rejectionReason;
      }
    }

    // 8. If status is interviewing, update interview rounds
    if (input.status === 'interviewing') {
      const updatedRounds = this.updateInterviewRounds(
        application.interviewRounds,
        job.interviewRounds,
        input.roundName
      );
      updateData.interviewRounds = updatedRounds;
    }

    // 9. Update application
    const updatedApplication = await this.applicationRepository.update(input.applicationId, updateData);

    // 10. Send email notification if status is updated to shortlisted
    if (input.status === 'shortlisted' && application.status !== 'shortlisted') {
      try {
        // Get developer profile to get userId
        const developerProfile = await this.developerProfileRepository.findById(application.developerId);
        if (developerProfile) {
          // Get company profile for company name
          const companyProfile = await this.companyProfileRepository.findByUserId(input.companyId);
          const companyName = companyProfile?.companyName || 'the company';
          
          // Get developer user email
          const developerUser = await this.userRepository.findById(developerProfile.userId);
          if (developerUser?.email) {
            await this.emailService.sendShortlistNotification(
              developerUser.email,
              companyName,
              job.title
            );
          }
        }
      } catch (error) {
        // Log error but don't fail the status update
        console.error('Failed to send shortlist notification email:', error);
      }
    }

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      message: `Application status updated to ${input.status} successfully`,
    };
  }

  private validateStatusTransition(
    currentStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
    jobInterviewRounds: string[],
    applicationInterviewRounds: any[]
  ): void {
    // Rejected can be set from any status
    if (newStatus === 'rejected') {
      return;
    }

    // Validate status is in job's interviewRounds if it's an interview-related status
    if (newStatus === 'interviewing') {
      // Check if we have interview rounds defined
      if (jobInterviewRounds.length === 0) {
        throw new ValidationError('Job does not have interview rounds defined');
      }

      // Find the next round that should be started
      const nextRound = this.getNextInterviewRound(applicationInterviewRounds, jobInterviewRounds);
      if (!nextRound) {
        throw new ValidationError('No more interview rounds available or all rounds are completed');
      }
    }

    // Validate standard status transitions
    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      'applied': ['shortlisted', 'rejected'],
      'shortlisted': ['interviewing', 'rejected'],
      'interviewing': ['rejected', 'offer_extended'],
      'offer_extended': ['offer_accepted', 'offer_declined', 'rejected'],
      'offer_accepted': [], // Terminal state
      'offer_declined': [], // Terminal state
      'rejected': [], // Terminal state
      'withdrawn': [], // Terminal state
    };

    const allowedNextStatuses = validTransitions[currentStatus];
    if (!allowedNextStatuses || !allowedNextStatuses.includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition from ${currentStatus} to ${newStatus}. Valid next statuses: ${allowedNextStatuses.join(', ')}`
      );
    }
  }

  private getNextInterviewRound(
    applicationInterviewRounds: any[],
    jobInterviewRounds: string[]
  ): string | null {
    // Find the first round that is not completed
    for (const roundName of jobInterviewRounds) {
      const round = applicationInterviewRounds.find(r => r.roundName === roundName);
      if (!round || round.status !== 'completed') {
        return roundName;
      }
    }
    return null;
  }

  private updateInterviewRounds(
    currentRounds: any[],
    jobInterviewRounds: string[],
    roundName?: string
  ): any[] {
    // If roundName is provided, use it; otherwise find the next round
    let targetRoundName: string;
    if (roundName) {
      // Validate roundName is in job's interviewRounds
      if (!jobInterviewRounds.includes(roundName)) {
        throw new ValidationError(`Round "${roundName}" is not defined in the job's interview rounds`);
      }
      targetRoundName = roundName;
    } else {
      // Find the next round
      const nextRound = this.getNextInterviewRound(currentRounds, jobInterviewRounds);
      if (!nextRound) {
        throw new ValidationError('No next interview round available');
      }
      targetRoundName = nextRound;
    }

    // Update or create the round
    const updatedRounds = [...currentRounds];
    const roundIndex = updatedRounds.findIndex(r => r.roundName === targetRoundName);
    
    if (roundIndex >= 0) {
      // Update existing round
      updatedRounds[roundIndex] = {
        ...updatedRounds[roundIndex],
        status: 'scheduled',
      };
    } else {
      // Add new round
      updatedRounds.push({
        roundName: targetRoundName,
        status: 'scheduled',
        interviewerIds: [],
      });
    }

    return updatedRounds;
  }
}

