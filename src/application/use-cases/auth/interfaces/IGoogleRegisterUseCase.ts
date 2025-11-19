import { GoogleRegisterInput, GoogleRegisterOutput } from '../../../dtos/auth.dto';

export interface IGoogleRegisterUseCase {
  execute(input: GoogleRegisterInput): Promise<GoogleRegisterOutput>;
}

