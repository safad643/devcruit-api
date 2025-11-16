import { ResetPasswordInput, ResetPasswordOutput } from '../../../dtos/auth.dto';

export interface IResetPasswordUseCase {
  execute(input: ResetPasswordInput): Promise<ResetPasswordOutput>;
}

