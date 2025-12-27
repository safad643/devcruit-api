import { 
  IApplicationRepository,
  IJobRepository
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';
import { ApplicationMetricsOutput } from '../../dtos/application.dto';
import { IGetApplicationMetricsUseCase } from './interfaces';

@injectable()
export class GetApplicationMetricsUseCase implements IGetApplicationMetricsUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository
  ) {}

  async execute(jobId: string, companyId: string): Promise<ApplicationMetricsOutput> {
    // Verify the job exists and belongs to the company
    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (job.companyId !== companyId) {
      throw new ForbiddenError('You do not have access to this job');
    }

    // Get metrics
    const metrics = await this._applicationRepository.getMetricsByJobId(jobId, companyId);

    return metrics;
  }
}

