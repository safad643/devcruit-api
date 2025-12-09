import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
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
import {
  RegisterUserInput,
  VerifyEmailInput,
  LoginInput,
  ResendOTPInput,
  ForgotPasswordInput,
  ResetPasswordInput
} from '../schemas/auth.schema';
import { config } from '../../config';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.RegisterUserUseCase) private registerUserUseCase: IRegisterUserUseCase,
    @inject(TYPES.VerifyEmailUseCase) private verifyEmailUseCase: IVerifyEmailUseCase,
    @inject(TYPES.LoginUseCase) private loginUseCase: ILoginUseCase,
    @inject(TYPES.AdminLoginUseCase) private adminLoginUseCase: IAdminLoginUseCase,
    @inject(TYPES.ResendOTPUseCase) private resendOTPUseCase: IResendOTPUseCase,
    @inject(TYPES.ForgotPasswordUseCase) private forgotPasswordUseCase: IForgotPasswordUseCase,
    @inject(TYPES.ResetPasswordUseCase) private resetPasswordUseCase: IResetPasswordUseCase,
    @inject(TYPES.RefreshTokenUseCase) private refreshTokenUseCase: IRefreshTokenUseCase,
    @inject(TYPES.LogoutUseCase) private logoutUseCase: ILogoutUseCase,
    @inject(TYPES.GoogleLoginUseCase) private googleLoginUseCase: IGoogleLoginUseCase,
    @inject(TYPES.GoogleRegisterUseCase) private googleRegisterUseCase: IGoogleRegisterUseCase
  ) { }

  // Arrow functions auto-bind 'this'
  register = async (request: FastifyRequest<{ Body: RegisterUserInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.registerUserUseCase.execute(request.body);
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  verifyEmail = async (request: FastifyRequest<{ Body: VerifyEmailInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.verifyEmailUseCase.execute(request.body);
    this.handleAuthResponse(reply, result);
  };

  login = async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.loginUseCase.execute(request.body);
    this.handleAuthResponse(reply, result);
  };

  adminLogin = async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.adminLoginUseCase.execute(request.body);
    this.handleAuthResponse(reply, result);
  };

  resendOTP = async (request: FastifyRequest<{ Body: ResendOTPInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.resendOTPUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  forgotPassword = async (request: FastifyRequest<{ Body: ForgotPasswordInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.forgotPasswordUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  resetPassword = async (request: FastifyRequest<{ Body: ResetPasswordInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.resetPasswordUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  refreshToken = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const oldRefreshToken = request.cookies.refreshToken;

    const result = await this.refreshTokenUseCase.execute({ refreshToken: oldRefreshToken });
    this.handleAuthResponse(reply, result);
  };

  googleLogin = async (
    request: FastifyRequest<{ Body: { code: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const result = await this.googleLoginUseCase.execute(request.body);
    this.handleAuthResponse(reply, result);
  };

  googleRegister = async (
    request: FastifyRequest<{ Body: { code: string; role: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const result = await this.googleRegisterUseCase.execute(request.body);
    this.handleAuthResponse(reply, result);
  };


  logout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const refreshToken = request.cookies.refreshToken;

    const result = await this.logoutUseCase.execute({ refreshToken });
    reply.clearCookie('refreshToken', { path: '/' });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  private handleAuthResponse(reply: FastifyReply, result: { refreshToken: string;[key: string]: any }): void {
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: 'strict',
      maxAge: config.security.refreshTokenMaxAgeMs,
      path: '/'
    });

    const { refreshToken, ...responseData } = result;
    reply.status(HttpStatus.OK).send(wrapSuccess(responseData));
  }
}
