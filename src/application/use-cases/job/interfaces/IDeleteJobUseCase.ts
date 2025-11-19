import { DeleteJobInput, DeleteJobOutput } from '../../../dtos/job.dto';

export interface IDeleteJobUseCase {
  execute(input: DeleteJobInput): Promise<DeleteJobOutput>;
}

