import { GetCompanyProfileOutput } from '../../../dtos/profile.dto';

export interface IGetCompanyProfileUseCase {
  execute(userId: string): Promise<GetCompanyProfileOutput>;
}

