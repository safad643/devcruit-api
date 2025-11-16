import { ResendOTPInput, ResendOTPOutput } from '../../../dtos/auth.dto';

export interface IResendOTPUseCase {
  execute(input: ResendOTPInput): Promise<ResendOTPOutput>;
}

