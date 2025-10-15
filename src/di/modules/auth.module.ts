import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import {
  RegisterUserUseCase,
  VerifyEmailUseCase,
  LoginUseCase,
  ResendOTPUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  RefreshTokenUseCase,
  LogoutUseCase
} from '../../application/use-cases/auth';
import { AuthController } from '../../presentation/controllers/AuthController';

export const authModule = new ContainerModule((bind) => {
  bind<RegisterUserUseCase>(TYPES.RegisterUserUseCase).to(RegisterUserUseCase);
  bind<VerifyEmailUseCase>(TYPES.VerifyEmailUseCase).to(VerifyEmailUseCase);
  bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);
  bind<ResendOTPUseCase>(TYPES.ResendOTPUseCase).to(ResendOTPUseCase);
  bind<ForgotPasswordUseCase>(TYPES.ForgotPasswordUseCase).to(ForgotPasswordUseCase);
  bind<ResetPasswordUseCase>(TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase);
  bind<RefreshTokenUseCase>(TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase);
  bind<LogoutUseCase>(TYPES.LogoutUseCase).to(LogoutUseCase);

  // Controllers
  bind<AuthController>(TYPES.AuthController).to(AuthController);
});
