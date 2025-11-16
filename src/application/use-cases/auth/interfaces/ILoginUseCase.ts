import { LoginInput, AuthTokensOutput } from '../../../dtos/auth.dto';

export interface ILoginUseCase {
  execute(input: LoginInput): Promise<AuthTokensOutput>;
}

