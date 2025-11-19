import { IJobRepository, ICompanyProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { PublicListJobsInput, PublicListJobsOutput } from '../../dtos/job.dto';
import { IPublicListJobsUseCase } from './interfaces';

@injectable()
export class PublicListJobsUseCase implements IPublicListJobsUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository
  ) {}

  async execute(input: PublicListJobsInput): Promise<PublicListJobsOutput> {
    const filters = {
      page: input.page,
      limit: input.limit,
      query: input.query,
      company: input.company,
      location: input.location,
      jobType: input.jobType,
      workArrangement: input.workArrangement,
      experienceLevel: input.experienceLevel,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    const result = await this.jobRepository.listPublicWithFilters(filters);

    const items = await Promise.all(result.jobs.map(async (job) => {
      // Fetch company profile for name/logo through repository
      const companyProfile = await this.companyProfileRepository.findByUserId(job.companyId);
      return {
        id: job.id,
        title: job.title,
        company: {
          id: job.companyId,
          name: companyProfile?.companyName ?? 'Unknown Company',
          logoUrl: companyProfile?.logoUrl,
        },
        category: job.category,
        experienceLevel: job.experienceLevel,
        jobType: job.jobType,
        workArrangement: job.workArrangement,
        location: job.location,
        compensation: job.compensation,
        createdAt: job.createdAt,
        validUntil: job.validUntil,
        tags: [...(job.requiredTech || []), ...(job.requiredSkills || [])].slice(0, 6),
      };
    }));

    return {
      items,
      total: result.total,
      page: input.page,
      limit: input.limit,
      hasNextPage: input.page * input.limit < result.total,
    };
  }
}


