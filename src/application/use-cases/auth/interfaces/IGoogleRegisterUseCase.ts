import { GoogleRegisterInput, GoogleRegisterOutput } from '../GoogleRegisterUseCase';

export interface IGoogleRegisterUseCase {
  execute(input: GoogleRegisterInput): Promise<GoogleRegisterOutput>;
}

