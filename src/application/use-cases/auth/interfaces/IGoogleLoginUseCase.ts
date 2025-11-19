import { GoogleLoginInput, GoogleLoginOutput } from '../../../dtos/auth.dto';

export interface IGoogleLoginUseCase {
  execute(input: GoogleLoginInput): Promise<GoogleLoginOutput>;
}

