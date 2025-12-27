import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository } from '../../../domain/repositories';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/errors';
import { OpenJobInput, OpenJobOutput } from '../../dtos/job.dto';
import { IOpenJobUseCase } from './interfaces';

@injectable()
export class OpenJobUseCase implements IOpenJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository
  ) {}

  async execute(input: OpenJobInput): Promise<OpenJobOutput> {
    const job = await this._jobRepository.findById(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    if (job.companyId !== input.companyId) {
      throw new ForbiddenError('You do not have permission to open this job');
    }
    if (job.status === 'open') {
      throw new ValidationError('Job is already open');
    }
    await this._jobRepository.update(input.jobId, { status: 'open' });
    return { message: 'Job opened successfully' };
  }
}


