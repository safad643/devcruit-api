import { LoginInput, AdminAuthTokensOutput } from '../../../dtos/auth.dto';

export interface IAdminLoginUseCase {
  execute(input: LoginInput): Promise<AdminAuthTokensOutput>;
}

