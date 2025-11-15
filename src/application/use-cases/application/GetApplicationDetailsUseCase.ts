import { 
  IApplicationRepository, 
  IJobRepository,
  IDeveloperProfileRepository,
  ICompanyProfileRepository,
  IUserRepository
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';
import { GetApplicationDetailsOutput } from '../../dtos/application.dto';

@injectable()
export class GetApplicationDetailsUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(applicationId: string, companyId: string): Promise<GetApplicationDetailsOutput> {
    // Get application
    const application = await this.applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Verify the application belongs to the company
    if (application.companyId !== companyId) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // Get job information
    const job = await this.jobRepository.findById(application.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Get developer profile
    const developerProfile = await this.developerProfileRepository.findById(application.developerId);
    
    // Get developer user information
    let developerName: string | undefined;
    let developerEmail: string | undefined;
    if (developerProfile) {
      const developerUser = await this.userRepository.findById(developerProfile.userId);
      developerName = developerUser?.email?.split('@')[0]; // Use email prefix as name fallback
      developerEmail = developerUser?.email;
    }

    // Get company profile
    const companyProfile = await this.companyProfileRepository.findByUserId(application.companyId);

    return {
      id: application.id,
      jobId: application.jobId,
      developerId: application.developerId,
      companyId: application.companyId,
      status: application.status,
      shortlistMethod: application.shortlistMethod,
      appliedAt: application.appliedAt,
      lastUpdatedAt: application.lastUpdatedAt,
      rejectedAt: application.rejectedAt,
      rejectedAtStage: application.rejectedAtStage,
      rejectionReason: application.rejectionReason,
      interviewRounds: application.interviewRounds,
      job: job ? {
        id: job.id,
        title: job.title,
        companyId: job.companyId,
        interviewRounds: job.interviewRounds,
      } : undefined,
      developer: developerProfile ? {
        id: developerProfile.id,
        userId: developerProfile.userId,
        name: developerName,
        email: developerEmail,
      } : undefined,
      company: companyProfile ? {
        id: companyProfile.id,
        companyName: companyProfile.companyName,
      } : undefined,
    };
  }
}

