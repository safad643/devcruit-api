import { IJobRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { PublicJobDetail } from '../../dtos/job.dto';
import { NotFoundError } from '../../../domain/errors';
import { getMongoDb } from '../../../infrastructure/database/mongodb/client';

@injectable()
export class PublicGetJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository
  ) {}

  async execute(id: string): Promise<PublicJobDetail> {
    const job = await this.jobRepository.findById(id);
    if (!job || job.status !== 'open') {
      throw new NotFoundError('Job not found');
    }

    const companyProfile = await getMongoDb().collection('company_profiles').findOne({ userId: job.companyId });

    return {
      id: job.id,
      title: job.title,
      company: {
        id: job.companyId,
        name: companyProfile?.companyName ?? 'Unknown Company',
        logoUrl: companyProfile?.employmentVerificationUrl,
      },
      category: job.category,
      experienceLevel: job.experienceLevel,
      jobType: job.jobType,
      workArrangement: job.workArrangement,
      location: job.location,
      compensation: job.compensation,
      createdAt: job.createdAt,
      validUntil: job.validUntil,
      description: job.description,
      benefits: job.benefits,
      requiredTech: job.requiredTech,
      requiredSkills: job.requiredSkills,
      niceTech: job.niceTech,
      niceSkills: job.niceSkills,
      minYears: job.minYears,
    };
  }
}


