import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository } from '../../../domain/repositories';
import { ForbiddenError, NotFoundError } from '../../../domain/errors';
import { IDeleteJobUseCase } from './interfaces';

@injectable()
export class DeleteJobUseCase implements IDeleteJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository
  ) {}

  async execute(input: { jobId: string; companyId: string }): Promise<void> {
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    if (job.companyId !== input.companyId) {
      throw new ForbiddenError('You do not have permission to delete this job');
    }
    await this.jobRepository.delete(input.jobId);
  }
}


