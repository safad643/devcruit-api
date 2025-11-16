import { LogoutInput, LogoutOutput } from '../../../dtos/auth.dto';

export interface ILogoutUseCase {
  execute(input: LogoutInput): Promise<LogoutOutput>;
}

