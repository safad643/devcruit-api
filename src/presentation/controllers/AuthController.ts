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
  ResetPasswordInput,
  GoogleLoginInput,
  GoogleRegisterInput
} from '../schemas/auth.schema';
import { config } from '../../config';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.RegisterUserUseCase) private _registerUserUseCase: IRegisterUserUseCase,
    @inject(TYPES.VerifyEmailUseCase) private _verifyEmailUseCase: IVerifyEmailUseCase,
    @inject(TYPES.LoginUseCase) private _loginUseCase: ILoginUseCase,
    @inject(TYPES.AdminLoginUseCase) private _adminLoginUseCase: IAdminLoginUseCase,
    @inject(TYPES.ResendOTPUseCase) private _resendOTPUseCase: IResendOTPUseCase,
    @inject(TYPES.ForgotPasswordUseCase) private _forgotPasswordUseCase: IForgotPasswordUseCase,
    @inject(TYPES.ResetPasswordUseCase) private _resetPasswordUseCase: IResetPasswordUseCase,
    @inject(TYPES.RefreshTokenUseCase) private _refreshTokenUseCase: IRefreshTokenUseCase,
    @inject(TYPES.LogoutUseCase) private _logoutUseCase: ILogoutUseCase,
    @inject(TYPES.GoogleLoginUseCase) private _googleLoginUseCase: IGoogleLoginUseCase,
    @inject(TYPES.GoogleRegisterUseCase) private _googleRegisterUseCase: IGoogleRegisterUseCase
  ) { }

  // Arrow functions auto-bind 'this'
  register = async (request: FastifyRequest<{ Body: RegisterUserInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._registerUserUseCase.execute(request.body);
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  verifyEmail = async (request: FastifyRequest<{ Body: VerifyEmailInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._verifyEmailUseCase.execute(request.body);
    this._handleAuthResponse(reply, result);
  };

  login = async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply): Promise<void> => {
    try {
      const result = await this._loginUseCase.execute(request.body);
      this._handleAuthResponse(reply, result);
    } catch (error) {
      request.log.warn({ email: request.body.email, ip: request.ip }, 'Failed login attempt');
      throw error;
    }
  };

  adminLogin = async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._adminLoginUseCase.execute(request.body);
    this._handleAuthResponse(reply, result);
  };

  resendOTP = async (request: FastifyRequest<{ Body: ResendOTPInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._resendOTPUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  forgotPassword = async (request: FastifyRequest<{ Body: ForgotPasswordInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._forgotPasswordUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  resetPassword = async (request: FastifyRequest<{ Body: ResetPasswordInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._resetPasswordUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  refreshToken = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const oldRefreshToken = request.cookies.refreshToken;

    const result = await this._refreshTokenUseCase.execute({ refreshToken: oldRefreshToken });
    this._handleAuthResponse(reply, result);
  };

  googleLogin = async (
    request: FastifyRequest<{ Body: GoogleLoginInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const result = await this._googleLoginUseCase.execute(request.body);
    this._handleAuthResponse(reply, result);
  };

  googleRegister = async (
    request: FastifyRequest<{ Body: GoogleRegisterInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const result = await this._googleRegisterUseCase.execute(request.body);
    this._handleAuthResponse(reply, result);
  };


  logout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const refreshToken = request.cookies.refreshToken;

    const result = await this._logoutUseCase.execute({ refreshToken });
    reply.clearCookie('refreshToken', { path: '/' });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  private _handleAuthResponse(reply: FastifyReply, result: { refreshToken: string;[key: string]: any }): void {
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
