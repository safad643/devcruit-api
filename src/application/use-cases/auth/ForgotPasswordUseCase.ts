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
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.OTPRepository) private _otpRepository: IOTPRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.CryptographicService) private _cryptographicService: ICryptographicService
  ) {}

  async execute(input: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
    // 1. Check if user exists
    const user = await this._userRepository.findByEmail(input.email);
    if (!user) {
      throw new NotFoundError('Account not found with this email.');
    }

    // 2. Generate OTP
    const otpCode = this._cryptographicService.generateOTP();

    // 3. Save OTP to Redis
    await this._otpRepository.save(input.email, otpCode, 'reset', config.otp.ttl);

    // 4. Send OTP via email
    await this._emailService.sendOTP(input.email, otpCode, 'reset');

    // 5. Return success response
    return {
      message: 'Password reset code sent to your email',
      email: input.email,
    };
  }
}
