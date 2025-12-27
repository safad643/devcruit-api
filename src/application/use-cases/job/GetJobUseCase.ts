import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository } from '../../../domain/repositories';
import { ForbiddenError, NotFoundError } from '../../../domain/errors';
import { IGetJobUseCase } from './interfaces';
import { GetJobInput } from '../../dtos/job.dto';

@injectable()
export class GetJobUseCase implements IGetJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository
  ) {}

  async execute(input: GetJobInput) {
    const job = await this._jobRepository.findById(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    if (job.companyId !== input.companyId) {
      throw new ForbiddenError('You do not have access to this job');
    }
    return job;
  }
}


