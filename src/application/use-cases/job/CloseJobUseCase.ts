import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository } from '../../../domain/repositories';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/errors';
import { ICloseJobUseCase } from './interfaces';

@injectable()
export class CloseJobUseCase implements ICloseJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository
  ) {}

  async execute(input: { jobId: string; companyId: string }): Promise<{ message: string }> {
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    if (job.companyId !== input.companyId) {
      throw new ForbiddenError('You do not have permission to close this job');
    }
    if (job.status === 'closed') {
      throw new ValidationError('Job is already closed');
    }

    await this.jobRepository.update(input.jobId, { status: 'closed' as any });
    return { message: 'Job closed successfully' };
  }
}


