import { CreateDeveloperProfileInput, CreateDeveloperProfileOutput } from '../../../dtos/profile.dto';

export interface ICreateDeveloperProfileUseCase {
  execute(input: CreateDeveloperProfileInput): Promise<CreateDeveloperProfileOutput>;
}

