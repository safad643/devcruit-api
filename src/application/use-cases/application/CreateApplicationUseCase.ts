import {
  IApplicationRepository,
  IJobRepository,
  IDeveloperProfileRepository,
  ICompanyProfileRepository,
  IUserRepository
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ValidationError } from '../../../domain/errors';
import { Application, InterviewRound } from '../../../domain/entities/Application';
import { CreateApplicationInput, CreateApplicationOutput } from '../../dtos/application.dto';
import { IEmailService, IAIMatchingService } from '../../services';
import { ICreateApplicationUseCase } from './interfaces';

@injectable()
export class CreateApplicationUseCase implements ICreateApplicationUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.AIMatchingService) private _aiMatchingService: IAIMatchingService
  ) { }

  async execute(input: CreateApplicationInput & { developerId: string }): Promise<CreateApplicationOutput> {
    // 1. Verify developer profile exists
    const developerProfile = await this._developerProfileRepository.findByUserId(input.developerId);
    if (!developerProfile) {
      throw new NotFoundError('Developer profile not found. Please complete your profile first.');
    }

    // 2. Get the job
    const job = await this._jobRepository.findById(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // 3. Check if job is open and valid
    if (job.status !== 'open') {
      throw new ValidationError('This job is not currently accepting applications');
    }

    if (job.validUntil < new Date()) {
      throw new ValidationError('This job posting has expired');
    }

    // 4. Check for duplicate application
    const existingApplication = await this._applicationRepository.findByJobIdAndDeveloperId(
      input.jobId,
      developerProfile.id
    );
    if (existingApplication) {
      throw new ValidationError('You have already applied to this job');
    }

    // 5. Get companyId from job
    const companyId = job.companyId;

    // 6. Determine initial status
    let status: 'applied' | 'shortlisted' = 'applied';
    let shortlistMethod: 'auto' | 'manual' | undefined = undefined;
    let interviewRounds: InterviewRound[] = [];
    let aiMatchScore: number | undefined = undefined;
    let aiMatchReason: string | undefined = undefined;

    // 7. Auto-shortlist logic using AI
    if (job.autoShortlist) {
      const matchResult = await this._aiMatchingService.getMatchScore(job, developerProfile);
      aiMatchScore = matchResult.score;
      aiMatchReason = matchResult.reason;

      if (matchResult.shouldShortlist) {
        status = 'shortlisted';
        shortlistMethod = 'auto';
        interviewRounds = job.interviewRounds.map(roundName => ({
          roundName,
          status: 'pending' as const,
          interviewerIds: [],
        }));
      }
    }

    // 8. Determine resume URL
    const resumeUrl = input.resumeUrl || developerProfile.resumeUrl;

    // 9. Create the application
    const applicationData = Application.create({
      jobId: input.jobId,
      developerId: developerProfile.id,
      companyId,
      status,
      shortlistMethod,
      interviewRounds,
      resumeUrl,
      aiMatchScore,
      aiMatchReason,
    });

    const createdApplication = await this._applicationRepository.create(applicationData);

    // 10. Send email notification if shortlisted
    if (status === 'shortlisted') {
      try {
        const companyProfile = await this._companyProfileRepository.findByUserId(companyId);
        const companyName = companyProfile?.companyName || 'the company';

        const developerUser = await this._userRepository.findById(input.developerId);
        if (developerUser?.email) {
          await this._emailService.sendShortlistNotification(
            developerUser.email,
            companyName,
            job.title
          );
        }
      } catch (error) {
        console.error('Failed to send shortlist notification email:', error);
      }
    }

    return {
      id: createdApplication.id,
      jobId: createdApplication.jobId,
      developerId: createdApplication.developerId,
      companyId: createdApplication.companyId,
      status: createdApplication.status,
      shortlistMethod: createdApplication.shortlistMethod,
      message: status === 'shortlisted'
        ? 'Application submitted and automatically shortlisted!'
        : 'Application submitted successfully',
    };
  }
}
