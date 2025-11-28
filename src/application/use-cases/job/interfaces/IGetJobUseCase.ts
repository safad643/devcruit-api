import { Job } from '../../../../domain/entities/Job';
import { GetJobInput } from '../../../dtos/job.dto';

export interface IGetJobUseCase {
  execute(input: GetJobInput): Promise<Job>;
}

