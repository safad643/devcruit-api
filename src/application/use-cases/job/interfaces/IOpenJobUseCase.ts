import { OpenJobInput, OpenJobOutput } from '../../dtos/job.dto';

export interface IOpenJobUseCase {
  execute(input: OpenJobInput): Promise<OpenJobOutput>;
}

