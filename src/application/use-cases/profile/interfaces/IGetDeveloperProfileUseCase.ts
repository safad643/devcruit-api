import { GetDeveloperProfileOutput } from '../../../dtos/profile.dto';

export interface IGetDeveloperProfileUseCase {
  execute(userId: string): Promise<GetDeveloperProfileOutput>;
}

