import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository } from '../../../domain/repositories';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/errors';

interface OpenJobInput {
  jobId: string;
  companyId: string;
}

@injectable()
export class OpenJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository
  ) {}

  async execute(input: OpenJobInput): Promise<{ message: string }> {
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


