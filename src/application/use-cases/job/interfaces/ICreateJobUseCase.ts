import { CreateJobInput, CreateJobOutput } from '../../../dtos/job.dto';

export interface ICreateJobUseCase {
  execute(input: CreateJobInput): Promise<CreateJobOutput>;
}

