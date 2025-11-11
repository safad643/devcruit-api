import { IJobRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ListJobsInput, ListJobsOutput, JobListItem } from '../../dtos/job.dto';

@injectable()
export class ListJobsUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository
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

    // Map to output DTO with all fields
    const jobs: JobListItem[] = result.jobs.map((job) => ({
      id: job.id,
      companyId: job.companyId,
      title: job.title,
      description: job.description,
      category: job.category,
      requiredTech: job.requiredTech,
      requiredSkills: job.requiredSkills,
      interviewRounds: job.interviewRounds,
      experienceLevel: job.experienceLevel,
      minYears: job.minYears,
      niceTech: job.niceTech,
      niceSkills: job.niceSkills,
      jobType: job.jobType,
      workArrangement: job.workArrangement,
      location: job.location,
      relocation: job.relocation,
      compensation: job.compensation,
      benefits: job.benefits,
      validUntil: job.validUntil,
      autoShortlist: job.autoShortlist,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));

    return {
      jobs,
      total: result.total,
      page: input.page,
      limit: input.limit,
    };
  }
}

