import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository, IApplicationRepository } from '../../../domain/repositories';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/errors';
import { JobProps } from '../../../domain/entities/Job';
import { IUpdateJobUseCase } from './interfaces';
import { UpdateJobInput, UpdateJobOutput } from '../../dtos/job.dto';

@injectable()
export class UpdateJobUseCase implements IUpdateJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository
  ) {}

  async execute(input: UpdateJobInput): Promise<UpdateJobOutput> {
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) throw new NotFoundError('Job not found');
    if (job.companyId !== input.companyId) throw new ForbiddenError('You do not have permission to edit this job');

    // Check if job has any applications - if so, prevent editing
    const applications = await this.applicationRepository.findByJobId(input.jobId);
    if (applications.length > 0) {
      throw new ValidationError('A job cannot be edited if someone has already applied to it');
    }

    const updates: Partial<JobProps> = { ...input.updates };

    const updated = await this.jobRepository.update(input.jobId, updates);
    return {
      id: updated.id,
      message: 'Job updated successfully'
    };
  }
}


