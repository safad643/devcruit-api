import { UpdateApplicationStatusInput, UpdateApplicationStatusOutput } from '../../../dtos/application.dto';

export interface IUpdateApplicationStatusUseCase {
  execute(input: UpdateApplicationStatusInput): Promise<UpdateApplicationStatusOutput>;
}

