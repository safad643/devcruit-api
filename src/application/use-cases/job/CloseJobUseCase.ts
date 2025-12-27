import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository } from '../../../domain/repositories';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/errors';
import { CloseJobInput, CloseJobOutput } from '../../dtos/job.dto';
import { ICloseJobUseCase } from './interfaces';

@injectable()
export class CloseJobUseCase implements ICloseJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository
  ) {}

  async execute(input: CloseJobInput): Promise<CloseJobOutput> {
    const job = await this._jobRepository.findById(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    if (job.companyId !== input.companyId) {
      throw new ForbiddenError('You do not have permission to close this job');
    }
    if (job.status === 'closed') {
      throw new ValidationError('Job is already closed');
    }

    await this._jobRepository.update(input.jobId, { status: 'closed' });
    return { message: 'Job closed successfully' };
  }
}


