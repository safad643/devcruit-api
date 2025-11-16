import { UpdateApplicationStatusInput, UpdateApplicationStatusOutput } from '../../../dtos/application.dto';

export interface IShortlistApplicationUseCase {
  execute(input: UpdateApplicationStatusInput): Promise<UpdateApplicationStatusOutput>;
}

