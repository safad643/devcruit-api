import { IJobRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { PublicListJobsInput, PublicListJobsOutput } from '../../dtos/job.dto';
import { getMongoDb } from '../../../infrastructure/database/mongodb/client';
import { IPublicListJobsUseCase } from './interfaces';

@injectable()
export class PublicListJobsUseCase implements IPublicListJobsUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository
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
      // Try to fetch company profile for name/logo
      // This is a small additional read if aggregation didn't include; safe fallback
      const companyProfile = await getMongoDb().collection('company_profiles').findOne({ userId: job.companyId });
      return {
        id: job.id,
        title: job.title,
        company: {
          id: job.companyId,
          name: companyProfile?.companyName ?? 'Unknown Company',
          logoUrl: companyProfile?.employmentVerificationUrl, // reusing as possible logo if stored
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


