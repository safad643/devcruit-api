import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { ValidationError } from '../../domain/errors';
import { 
  RegisterUserUseCase,
  VerifyEmailUseCase,
  LoginUseCase,
  ResendOTPUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  GoogleLoginUseCase,      
  GoogleRegisterUseCase
} from '../../application/use-cases/auth';
import {
  RegisterUserInput,
  VerifyEmailInput,
  LoginInput,
  ResendOTPInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  RefreshTokenInput
} from '../schemas/auth.schema';
import { config } from '../../config';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.RegisterUserUseCase) private registerUserUseCase: RegisterUserUseCase,
    @inject(TYPES.VerifyEmailUseCase) private verifyEmailUseCase: VerifyEmailUseCase,
    @inject(TYPES.LoginUseCase) private loginUseCase: LoginUseCase,
    @inject(TYPES.ResendOTPUseCase) private resendOTPUseCase: ResendOTPUseCase,
    @inject(TYPES.ForgotPasswordUseCase) private forgotPasswordUseCase: ForgotPasswordUseCase,
    @inject(TYPES.ResetPasswordUseCase) private resetPasswordUseCase: ResetPasswordUseCase,
    @inject(TYPES.RefreshTokenUseCase) private refreshTokenUseCase: RefreshTokenUseCase,
    @inject(TYPES.LogoutUseCase) private logoutUseCase: LogoutUseCase,
    @inject(TYPES.GoogleLoginUseCase) private googleLoginUseCase: GoogleLoginUseCase,           
    @inject(TYPES.GoogleRegisterUseCase) private googleRegisterUseCase: GoogleRegisterUseCase
  ) {}

  // Arrow functions auto-bind 'this'
  register = async (request: FastifyRequest<{ Body: RegisterUserInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.registerUserUseCase.execute(request.body);
    reply.status(201).send(result);
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
    reply.status(200).send(responseData);
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
    reply.status(200).send(responseData);
  };

  resendOTP = async (request: FastifyRequest<{ Body: ResendOTPInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.resendOTPUseCase.execute(request.body);
    reply.status(200).send(result);
  };

  forgotPassword = async (request: FastifyRequest<{ Body: ForgotPasswordInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.forgotPasswordUseCase.execute(request.body);
    reply.status(200).send(result);
  };

  resetPassword = async (request: FastifyRequest<{ Body: ResetPasswordInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.resetPasswordUseCase.execute(request.body);
    reply.status(200).send(result);
  };

  refreshToken = async (request: FastifyRequest<{ Body: RefreshTokenInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.refreshTokenUseCase.execute(request.body);
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    // Exclude refresh token from response body
    const { refreshToken, ...responseData } = result;
    reply.status(200).send(responseData);
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
    reply.status(200).send(responseData);
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
    reply.status(200).send(responseData);
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
    reply.status(200).send(result);
  };
}
