import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import {
  RegisterUserUseCase,
  VerifyEmailUseCase,
  LoginUseCase,
  AdminLoginUseCase,
  ResendOTPUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  GoogleLoginUseCase,
  GoogleRegisterUseCase
} from '../../application/use-cases/auth';
import { AuthController } from '../../presentation/controllers/AuthController';

export const authModule = new ContainerModule((bind) => {
  bind<RegisterUserUseCase>(TYPES.RegisterUserUseCase).to(RegisterUserUseCase);
  bind<VerifyEmailUseCase>(TYPES.VerifyEmailUseCase).to(VerifyEmailUseCase);
  bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);
  bind<AdminLoginUseCase>(TYPES.AdminLoginUseCase).to(AdminLoginUseCase);
  bind<ResendOTPUseCase>(TYPES.ResendOTPUseCase).to(ResendOTPUseCase);
  bind<ForgotPasswordUseCase>(TYPES.ForgotPasswordUseCase).to(ForgotPasswordUseCase);
  bind<ResetPasswordUseCase>(TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase);
  bind<RefreshTokenUseCase>(TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase);
  bind<GoogleLoginUseCase>(TYPES.GoogleLoginUseCase).to(GoogleLoginUseCase);
  bind<GoogleRegisterUseCase>(TYPES.GoogleRegisterUseCase).to(GoogleRegisterUseCase);
  bind<LogoutUseCase>(TYPES.LogoutUseCase).to(LogoutUseCase);
  

  // Controllers
  bind<AuthController>(TYPES.AuthController).to(AuthController);
});
