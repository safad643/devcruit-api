import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository } from '../../../domain/repositories';
import { NotFoundError } from '../../../domain/errors';

@injectable()
export class GetJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository
  ) {}

  async execute(jobId: string) {
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new NotFoundError('Job not found');
    return job;
  }
}


