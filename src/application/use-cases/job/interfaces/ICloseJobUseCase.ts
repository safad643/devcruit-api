import { CloseJobInput, CloseJobOutput } from '../../../dtos/job.dto';

export interface ICloseJobUseCase {
  execute(input: CloseJobInput): Promise<CloseJobOutput>;
}

