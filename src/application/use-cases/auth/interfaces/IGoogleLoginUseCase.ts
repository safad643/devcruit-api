import { GoogleLoginInput, GoogleLoginOutput } from '../GoogleLoginUseCase';

export interface IGoogleLoginUseCase {
  execute(input: GoogleLoginInput): Promise<GoogleLoginOutput>;
}

