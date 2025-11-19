import { UpdateJobInput, UpdateJobOutput } from '../../../dtos/job.dto';

export interface IUpdateJobUseCase {
  execute(input: UpdateJobInput): Promise<UpdateJobOutput>;
}

