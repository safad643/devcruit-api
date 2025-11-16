import { 
  IApplicationRepository, 
  IJobRepository,
  ICompanyProfileRepository,
  IDeveloperProfileRepository
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError } from '../../../domain/errors';
import { ListApplicationsForDeveloperInput, ListApplicationsForDeveloperOutput, DeveloperApplicationListItem } from '../../dtos/application.dto';
import { IListApplicationsForDeveloperUseCase } from './interfaces';

@injectable()
export class ListApplicationsForDeveloperUseCase implements IListApplicationsForDeveloperUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.DeveloperProfileRepository) private developerProfileRepository: IDeveloperProfileRepository
  ) {}

  async execute(input: ListApplicationsForDeveloperInput & { developerId: string }): Promise<ListApplicationsForDeveloperOutput> {
    // Get developer profile to get the developerId (profile ID)
    // Note: input.developerId is the userId, we need to get the profile ID
    const developerProfile = await this.developerProfileRepository.findByUserId(input.developerId);
    if (!developerProfile) {
      throw new NotFoundError('Developer profile not found');
    }

    // Build filters
    const filters = {
      developerId: developerProfile.id, // Use profile ID, not userId
      status: input.status,
      page: input.page,
      limit: input.limit,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    // Get applications
    const result = await this.applicationRepository.listWithFilters(filters);

    // Enrich applications with job and company information
    const enrichedApplications: DeveloperApplicationListItem[] = await Promise.all(
      result.applications.map(async (application) => {
        // Get job information
        const job = await this.jobRepository.findById(application.jobId);
        
        // Get company profile
        const companyProfile = await this.companyProfileRepository.findByUserId(application.companyId);

        return {
          id: application.id,
          jobId: application.jobId,
          companyId: application.companyId,
          status: application.status,
          shortlistMethod: application.shortlistMethod,
          appliedAt: application.appliedAt,
          lastUpdatedAt: application.lastUpdatedAt,
          rejectedAt: application.rejectedAt,
          rejectedAtStage: application.rejectedAtStage,
          rejectionReason: application.rejectionReason,
          interviewRounds: application.interviewRounds,
          jobTitle: job?.title,
          companyName: companyProfile?.companyName,
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

