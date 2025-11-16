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
import {
  IRegisterUserUseCase,
  IVerifyEmailUseCase,
  ILoginUseCase,
  IAdminLoginUseCase,
  IResendOTPUseCase,
  IForgotPasswordUseCase,
  IResetPasswordUseCase,
  IRefreshTokenUseCase,
  ILogoutUseCase,
  IGoogleLoginUseCase,
  IGoogleRegisterUseCase
} from '../../application/use-cases/auth/interfaces';

export const authModule = new ContainerModule((bind) => {
  bind<IRegisterUserUseCase>(TYPES.RegisterUserUseCase).to(RegisterUserUseCase);
  bind<IVerifyEmailUseCase>(TYPES.VerifyEmailUseCase).to(VerifyEmailUseCase);
  bind<ILoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);
  bind<IAdminLoginUseCase>(TYPES.AdminLoginUseCase).to(AdminLoginUseCase);
  bind<IResendOTPUseCase>(TYPES.ResendOTPUseCase).to(ResendOTPUseCase);
  bind<IForgotPasswordUseCase>(TYPES.ForgotPasswordUseCase).to(ForgotPasswordUseCase);
  bind<IResetPasswordUseCase>(TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase);
  bind<IRefreshTokenUseCase>(TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase);
  bind<IGoogleLoginUseCase>(TYPES.GoogleLoginUseCase).to(GoogleLoginUseCase);
  bind<IGoogleRegisterUseCase>(TYPES.GoogleRegisterUseCase).to(GoogleRegisterUseCase);
  bind<ILogoutUseCase>(TYPES.LogoutUseCase).to(LogoutUseCase);

  // Controllers
  bind<AuthController>(TYPES.AuthController).to(AuthController);
});
