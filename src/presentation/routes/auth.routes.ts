import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { AuthController } from '../controllers/AuthController';
import {
  RegisterUserSchema,
  VerifyEmailSchema,
  LoginSchema,
  ResendOTPSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  GoogleLoginSchema,
  GoogleRegisterSchema
} from '../schemas/auth.schema';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const authController = container.get<AuthController>(TYPES.AuthController);

  fastify.post('/register', { schema: { body: RegisterUserSchema } }, authController.register);
  fastify.post('/verify-email', { schema: {  body: VerifyEmailSchema } }, authController.verifyEmail);
  fastify.post('/login', { schema: { body: LoginSchema } }, authController.login);
  fastify.post('/admin/login', { schema: { body: LoginSchema } }, authController.adminLogin);
  fastify.post('/resend-otp', { schema: { body: ResendOTPSchema } }, authController.resendOTP);
  fastify.post('/forgot-password', { schema: { body: ForgotPasswordSchema } }, authController.forgotPassword);
  fastify.post('/reset-password', { schema: { body: ResetPasswordSchema } }, authController.resetPassword);
  fastify.post('/refresh-token',authController.refreshToken);
  fastify.post('/google-login', { schema: { body: GoogleLoginSchema } }, authController.googleLogin);
  fastify.post('/google-register', { schema: { body: GoogleRegisterSchema } }, authController.googleRegister);

  fastify.post('/logout', authController.logout);
  // Authenticated routes
}
