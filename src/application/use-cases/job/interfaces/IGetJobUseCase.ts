import { Job } from '../../../../domain/entities/Job';

export interface IGetJobUseCase {
  execute(jobId: string): Promise<Job>;
}

