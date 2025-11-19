import { IJobRepository, IApplicationRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ListJobsInput, ListJobsOutput, JobListSummary } from '../../dtos/job.dto';
import { IListJobsUseCase } from './interfaces';

@injectable()
export class ListJobsUseCase implements IListJobsUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository
  ) {}

  async execute(input: ListJobsInput & { companyId: string }): Promise<ListJobsOutput> {
    // Map input to repository filters
    const filters = {
      companyId: input.companyId,
      page: input.page,
      limit: input.limit,
      search: input.search,
      status: input.status && input.status !== 'all' ? input.status : undefined,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    // Call repository
    const result = await this.jobRepository.listWithFilters(filters);

    // Map to lightweight output DTO with only fields used in list view
    const jobs: JobListSummary[] = await Promise.all(
      result.jobs.map(async (job) => {
        const applications = await this.applicationRepository.findByJobId(job.id);
        return {
          id: job.id,
          title: job.title,
          category: job.category,
          jobType: job.jobType,
          workArrangement: job.workArrangement,
          experienceLevel: job.experienceLevel,
          status: job.status,
          createdAt: job.createdAt,
          validUntil: job.validUntil,
          applicationCount: applications.length,
        };
      })
    );

    return {
      jobs,
      total: result.total,
      page: input.page,
      limit: input.limit,
    };
  }
}

