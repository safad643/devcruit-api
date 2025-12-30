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
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository
  ) { }

  async execute(input: ListApplicationsForDeveloperInput & { developerId: string }): Promise<ListApplicationsForDeveloperOutput> {

    const developerProfile = await this._developerProfileRepository.findByUserId(input.developerId);
    if (!developerProfile) {
      throw new NotFoundError('Developer profile not found');
    }

    // Build filters
    const filters = {
      developerId: developerProfile.id, // Use profile ID, not userId
      jobId: input.jobId,
      status: input.status,
      page: input.page,
      limit: input.limit,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    // Get applications
    const result = await this._applicationRepository.listWithFilters(filters);

    // Enrich applications with job and company information
    const enrichedApplications: DeveloperApplicationListItem[] = await Promise.all(
      result.applications.map(async (application) => {
        // Get job information
        const job = await this._jobRepository.findById(application.jobId);

        // Get company profile
        const companyProfile = await this._companyProfileRepository.findByUserId(application.companyId);

        // Compute hasScheduledInterview from interviewRounds
        const hasScheduledInterview = application.interviewRounds?.some(
          (r) => r.status === 'scheduled' && !r.result
        ) ?? false;

        return {
          id: application.id,
          status: application.status,
          appliedAt: application.appliedAt,
          hasScheduledInterview,
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

