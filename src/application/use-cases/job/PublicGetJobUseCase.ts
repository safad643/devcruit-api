import { IJobRepository, ICompanyProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { PublicJobDetail } from '../../dtos/job.dto';
import { NotFoundError } from '../../../domain/errors';
import { IPublicGetJobUseCase } from './interfaces';

@injectable()
export class PublicGetJobUseCase implements IPublicGetJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository
  ) {}

  async execute(id: string): Promise<PublicJobDetail> {
    const job = await this._jobRepository.findById(id);
    if (!job || job.status !== 'open') {
      throw new NotFoundError('Job not found');
    }

    const companyProfile = await this._companyProfileRepository.findByUserId(job.companyId);

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
      description: job.description,
      benefits: job.benefits,
      requiredTech: job.requiredTech,
      requiredSkills: job.requiredSkills,
      niceTech: job.niceTech,
      niceSkills: job.niceSkills,
      minYears: job.minYears,
      interviewRounds: job.interviewRounds,
      relocation: job.relocation,
      autoShortlist: job.autoShortlist,
    };
  }
}


