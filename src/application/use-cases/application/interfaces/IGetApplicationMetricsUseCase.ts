import { ApplicationMetricsOutput } from '../../../dtos/application.dto';

export interface IGetApplicationMetricsUseCase {
  execute(jobId: string, companyId: string): Promise<ApplicationMetricsOutput>;
}

