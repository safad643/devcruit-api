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
import { Job } from '../../../domain/entities/Job';
import { DeveloperProfile } from '../../../domain/entities/DeveloperProfile';
import { CreateApplicationInput, CreateApplicationOutput } from '../../dtos/application.dto';
import { IEmailService } from '../../services';
import { ICreateApplicationUseCase } from './interfaces';
import { getExperienceLevelValue } from '../../../domain/constants/experienceLevel';

@injectable()
export class CreateApplicationUseCase implements ICreateApplicationUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService
  ) {}

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

    // 5. Get companyId from job (job.companyId is the userId of the company)
    const companyId = job.companyId;

    // 6. Determine initial status and shortlist method
    let status: 'applied' | 'shortlisted' = 'applied';
    let shortlistMethod: 'auto' | 'manual' | undefined = undefined;
    let interviewRounds: InterviewRound[] = [];

    // 7. Auto-shortlist logic
    if (job.autoShortlist) {
      const isMatch = this._checkProfileMatch(job, developerProfile);
      if (isMatch) {
        status = 'shortlisted';
        shortlistMethod = 'auto';
        // Copy interview rounds from job
        interviewRounds = job.interviewRounds.map(roundName => ({
          roundName,
          status: 'pending' as const,
          interviewerIds: [],
        }));
      }
    }

    // 8. Determine resume URL - use provided resumeUrl or fall back to profile resumeUrl
    const resumeUrl = input.resumeUrl || developerProfile.resumeUrl;

    // 9. Create the application
    const applicationData = Application.create({
      jobId: input.jobId,
      developerId: developerProfile.id,
      companyId: companyId,
      status,
      shortlistMethod,
      interviewRounds,
      resumeUrl,
    });

    const createdApplication = await this._applicationRepository.create(applicationData);

    // 10. Send email notification if shortlisted
    if (status === 'shortlisted') {
      try {
        // Get company profile for company name
        const companyProfile = await this._companyProfileRepository.findByUserId(companyId);
        const companyName = companyProfile?.companyName || 'the company';
        
        // Get developer user email
        const developerUser = await this._userRepository.findById(input.developerId);
        if (developerUser?.email) {
          await this._emailService.sendShortlistNotification(
            developerUser.email,
            companyName,
            job.title
          );
        }
      } catch (error) {
        // Log error but don't fail the application creation
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

  private _checkProfileMatch(job: Job, developerProfile: DeveloperProfile): boolean {
    // Check required tech match
    const requiredTechMatch = job.requiredTech.every((tech: string) => 
      developerProfile.techs.some((devTech: string) => 
        devTech.toLowerCase() === tech.toLowerCase()
      )
    );

    // Check required skills match
    const requiredSkillsMatch = job.requiredSkills.every((skill: string) => 
      developerProfile.skills.some((devSkill: string) => 
        devSkill.toLowerCase() === skill.toLowerCase()
      )
    );

    // Check experience level match
    const experienceLevelMatch = this._checkExperienceLevelMatch(
      job.experienceLevel,
      developerProfile.seniorityLevel
    );

    // Check years of experience
    const yearsExperienceMatch = developerProfile.yearsExperience >= job.minYears;

    // All required criteria must match
    return requiredTechMatch && requiredSkillsMatch && experienceLevelMatch && yearsExperienceMatch;
  }

  private _checkExperienceLevelMatch(jobLevel: string, developerLevel: string): boolean {
    const jobLevelNum = getExperienceLevelValue(jobLevel);
    const devLevelNum = getExperienceLevelValue(developerLevel);

    // Developer level should be at least equal to job level
    return devLevelNum >= jobLevelNum;
  }
}

