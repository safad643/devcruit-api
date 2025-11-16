import { RegisterUserInput, RegisterUserOutput } from '../../../dtos/auth.dto';

export interface IRegisterUserUseCase {
  execute(input: RegisterUserInput): Promise<RegisterUserOutput>;
}

