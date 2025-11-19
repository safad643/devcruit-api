import { IUserRepository, IOTPRepository } from '../../../domain/repositories';
import { IEmailService, ICryptographicService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ForgotPasswordInput, ForgotPasswordOutput } from '../../dtos/auth.dto';
import { NotFoundError } from '../../../domain/errors';
import { config } from '../../../config';
import { IForgotPasswordUseCase } from './interfaces';

@injectable()
export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.OTPRepository) private otpRepository: IOTPRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService,
    @inject(TYPES.CryptographicService) private cryptographicService: ICryptographicService
  ) {}

  async execute(input: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
    // 1. Check if user exists
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new NotFoundError('Account not found with this email.');
    }

    // 2. Generate OTP
    const otpCode = this.cryptographicService.generateOTP();

    // 3. Save OTP to Redis
    await this.otpRepository.save(input.email, otpCode, 'reset', config.otp.ttl);

    // 4. Send OTP via email
    await this.emailService.sendOTP(input.email, otpCode, 'reset');

    // 5. Return success response
    return {
      message: 'Password reset code sent to your email',
      email: input.email,
    };
  }
}
