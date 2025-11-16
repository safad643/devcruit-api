import { ForgotPasswordInput, ForgotPasswordOutput } from '../../../dtos/auth.dto';

export interface IForgotPasswordUseCase {
  execute(input: ForgotPasswordInput): Promise<ForgotPasswordOutput>;
}

