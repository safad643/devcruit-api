import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository } from '../../../domain/repositories';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/errors';
import { IOpenJobUseCase } from './interfaces';

@injectable()
export class OpenJobUseCase implements IOpenJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository
  ) {}

  async execute(input: { jobId: string; companyId: string }): Promise<{ message: string }> {
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    if (job.companyId !== input.companyId) {
      throw new ForbiddenError('You do not have permission to open this job');
    }
    if (job.status === 'open') {
      throw new ValidationError('Job is already open');
    }
    await this.jobRepository.update(input.jobId, { status: 'open' as any });
    return { message: 'Job opened successfully' };
  }
}


