import { CreateApplicationInput, CreateApplicationOutput } from '../../../dtos/application.dto';

export interface ICreateApplicationUseCase {
  execute(input: CreateApplicationInput & { developerId: string }): Promise<CreateApplicationOutput>;
}

