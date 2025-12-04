import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository, ICompanyTeamRepository, IJobRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { InterviewRoundResult, InterviewRoundStatus, StatusNotes, ApplicationStatus } from '../../../domain/entities/Application';
import { IUpdateInterviewResultUseCase, UpdateInterviewResultInput, UpdateInterviewResultOutput } from './interfaces';

@injectable()
export class UpdateInterviewResultUseCase implements IUpdateInterviewResultUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository,
    @inject(TYPES.CompanyTeamRepository) private companyTeamRepository: ICompanyTeamRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository
  ) {}

  async execute(input: UpdateInterviewResultInput & { interviewerId: string }): Promise<UpdateInterviewResultOutput> {
    // 1. Get application
    const application = await this.applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // 2. Verify interviewer is assigned to this interview round
    const round = application.interviewRounds.find(r => r.roundName === input.roundName);
    if (!round) {
      throw new NotFoundError(`Interview round "${input.roundName}" not found`);
    }

    if (!round.interviewerIds.includes(input.interviewerId)) {
      throw new ForbiddenError('You are not assigned to this interview round');
    }

    // 3. Verify round is scheduled
    if (round.status !== 'scheduled') {
      throw new ValidationError(`Interview round "${input.roundName}" is not scheduled`);
    }

    // 4. Hard rule: video call must be completed before submitting result/feedback
    if (round.videoCallStatus !== 'ended') {
      throw new ValidationError('Cannot submit interview result before the video call is completed');
    }

    // 5. Validate result
    const validResults = Object.values(InterviewRoundResult);
    if (!validResults.includes(input.result as InterviewRoundResult)) {
      throw new ValidationError(`Result must be one of: ${validResults.join(', ')}`);
    }

    // 6. Update the interview round
    const updatedRounds = application.interviewRounds.map(r => {
      if (r.roundName === input.roundName) {
        return {
          ...r,
          status: 'completed' as InterviewRoundStatus,
          result: input.result,
          feedback: input.feedback,
          completedAt: new Date(),
        };
      }
      return r;
    });

    // 7. Determine application status update based on result
    const job = await this.jobRepository.findById(application.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    let statusUpdate: Partial<{ status: ApplicationStatus; rejectedAt: Date; rejectedAtStage: string; statusNotes: StatusNotes }> = {};

    // If result is fail, reject the application
    if (input.result === InterviewRoundResult.FAIL) {
      const now = new Date();
      statusUpdate = {
        status: 'rejected' as ApplicationStatus,
        rejectedAt: now,
        rejectedAtStage: input.roundName,
      };
      
      // Add feedback to statusNotes if provided
      if (input.feedback) {
        const statusNotes: StatusNotes = {
          ...application.statusNotes,
          rejected: input.feedback.trim(),
        };
        statusUpdate.statusNotes = statusNotes;
      }
    } 
    // If result is pass and this is the last round, mark as interview_completed
    else if (input.result === InterviewRoundResult.PASS) {
      const isLastRound = job.interviewRounds.length > 0 && 
        job.interviewRounds[job.interviewRounds.length - 1] === input.roundName;
      if (isLastRound) {
        statusUpdate = {
          status: 'interview_completed' as ApplicationStatus,
        };
      }
    }

    // 8. Update application
    const updatedApplication = await this.applicationRepository.update(input.applicationId, {
      interviewRounds: updatedRounds,
      ...statusUpdate,
    });

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      interviewRounds: updatedApplication.interviewRounds.map(round => ({
        roundName: round.roundName,
        status: round.status,
        result: round.result,
        feedback: round.feedback,
        completedAt: round.completedAt,
      })),
      message: `Interview result for "${input.roundName}" updated successfully`,
    };
  }
}

