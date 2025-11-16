import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { ValidationError } from '../../domain/errors';
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
  ) {}

  // Arrow functions auto-bind 'this'
  register = async (request: FastifyRequest<{ Body: RegisterUserInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.registerUserUseCase.execute(request.body);
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  verifyEmail = async (request: FastifyRequest<{ Body: VerifyEmailInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.verifyEmailUseCase.execute(request.body);
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    // Exclude refresh token from response body
    const { refreshToken, ...responseData } = result;
    reply.status(HttpStatus.OK).send(wrapSuccess(responseData));
  };

  login = async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.loginUseCase.execute(request.body);
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    // Exclude refresh token from response body
    const { refreshToken, ...responseData } = result;
    reply.status(HttpStatus.OK).send(wrapSuccess(responseData));
  };

  adminLogin = async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.adminLoginUseCase.execute(request.body);
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    const { refreshToken, ...responseData } = result;
    reply.status(HttpStatus.OK).send(wrapSuccess(responseData));
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
    const oldrefreshToken = request.cookies.refreshToken;
  
  if (!oldrefreshToken) {
    throw new ValidationError('Refresh token not found');
  }const result = await this.refreshTokenUseCase.execute({ refreshToken:oldrefreshToken});


    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    // Exclude refresh token from response body
    const { refreshToken, ...responseData } = result;
    reply.status(HttpStatus.OK).send(wrapSuccess(responseData));
  };

  googleLogin = async (
    request: FastifyRequest<{ Body: { code: string } }>, 
    reply: FastifyReply
  ): Promise<void> => {
    const result = await this.googleLoginUseCase.execute(request.body);
    
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
  
    // Exclude refresh token from response body
    const { refreshToken, ...responseData } = result;
    reply.status(HttpStatus.OK).send(wrapSuccess(responseData));
  };
  
  googleRegister = async (
    request: FastifyRequest<{ Body: { code: string; role: string } }>, 
    reply: FastifyReply
  ): Promise<void> => {
    const result = await this.googleRegisterUseCase.execute(request.body);
    
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
  
    // Exclude refresh token from response body
    const { refreshToken, ...responseData } = result;
    reply.status(HttpStatus.OK).send(wrapSuccess(responseData));
  };
  

  logout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Get refresh token from cookies
    const refreshToken = request.cookies.refreshToken;
    
    // Check if refresh token exists in cookies
    if (!refreshToken) {
      throw new ValidationError('Refresh token not found in cookies');
    }

    const result = await this.logoutUseCase.execute({ refreshToken });
    reply.clearCookie('refreshToken', { path: '/' });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };
}
