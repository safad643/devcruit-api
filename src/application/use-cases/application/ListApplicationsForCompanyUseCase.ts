import { 
  IApplicationRepository, 
  IJobRepository,
  IDeveloperProfileRepository,
  IUserRepository
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ForbiddenError } from '../../../domain/errors';
import { ListApplicationsForCompanyInput, ListApplicationsForCompanyOutput, ApplicationListItem } from '../../dtos/application.dto';
import { IListApplicationsForCompanyUseCase } from './interfaces';

@injectable()
export class ListApplicationsForCompanyUseCase implements IListApplicationsForCompanyUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository
  ) {}

  async execute(input: ListApplicationsForCompanyInput & { companyId: string }): Promise<ListApplicationsForCompanyOutput> {
    // Build filters
    const filters = {
      companyId: input.companyId,
      jobId: input.jobId,
      status: input.status,
      page: input.page,
      limit: input.limit,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    // Get applications
    const result = await this._applicationRepository.listWithFilters(filters);

    // Enrich applications with job and developer information
    const enrichedApplications: ApplicationListItem[] = await Promise.all(
      result.applications.map(async (application) => {
        // Get job information
        const job = await this._jobRepository.findById(application.jobId);
        
        // Get developer profile
        const developerProfile = await this._developerProfileRepository.findById(application.developerId);
        
        // Get developer user information
        let developerName: string | undefined;
        let developerEmail: string | undefined;
        let developerUserId: string | undefined;
        if (developerProfile) {
          const developerUser = await this._userRepository.findById(developerProfile.userId);
          developerName = developerUser?.name;
          developerEmail = developerUser?.email;
          developerUserId = developerUser?.id;
        }

        // Verify the job belongs to the company (security check)
        if (job && job.companyId !== input.companyId) {
          throw new ForbiddenError('You do not have access to this application');
        }

        return {
          id: application.id,
          jobId: application.jobId,
          developerId: application.developerId,
          companyId: application.companyId,
          status: application.status,
          shortlistMethod: application.shortlistMethod,
          statusNotes: application.statusNotes,
          appliedAt: application.appliedAt,
          lastUpdatedAt: application.lastUpdatedAt,
          rejectedAt: application.rejectedAt,
          rejectedAtStage: application.rejectedAtStage,
          interviewRounds: application.interviewRounds,
          jobTitle: job?.title,
          developerName,
          developerEmail,
          developerUserId,
        };
      })
    );

    return {
      applications: enrichedApplications,
      total: result.total,
      page: input.page,
      limit: input.limit,
    };
  }
}

