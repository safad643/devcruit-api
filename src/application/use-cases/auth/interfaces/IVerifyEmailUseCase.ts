import { VerifyEmailInput, AuthTokensOutput } from '../../../dtos/auth.dto';

export interface IVerifyEmailUseCase {
  execute(input: VerifyEmailInput): Promise<AuthTokensOutput>;
}

