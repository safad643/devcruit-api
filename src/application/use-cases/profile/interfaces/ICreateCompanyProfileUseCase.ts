import { CreateCompanyProfileInput, CreateCompanyProfileOutput } from '../../../dtos/profile.dto';

export interface ICreateCompanyProfileUseCase {
  execute(input: CreateCompanyProfileInput): Promise<CreateCompanyProfileOutput>;
}

