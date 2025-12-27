import { IUserRepository, IPendingUserRepository, IOTPRepository } from '../../../domain/repositories';
import { IEmailService, ICryptographicService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ResendOTPInput, ResendOTPOutput } from '../../dtos/auth.dto';
import { NotFoundError, TooManyRequestsError } from '../../../domain/errors';
import { config } from '../../../config';
import { IResendOTPUseCase } from './interfaces';

@injectable()
export class ResendOTPUseCase implements IResendOTPUseCase {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.PendingUserRepository) private _pendingUserRepository: IPendingUserRepository,
    @inject(TYPES.OTPRepository) private _otpRepository: IOTPRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.CryptographicService) private _cryptographicService: ICryptographicService
  ) {}

  async execute(input: ResendOTPInput): Promise<ResendOTPOutput> {
    const { email, type } = input;

    // 1. Check rate limit
    const attempts = await this._otpRepository.incrementResendCount(email, type, config.otp.ttl);

    if (attempts > config.otp.maxAttempts) {
      throw new TooManyRequestsError(
        `Maximum resend attempts exceeded. Please try again after ${config.otp.ttl} seconds.`
      );
    }

    // 2. Validate based on type
    if (type === 'register') {
      const pendingUser = await this._pendingUserRepository.findByEmail(email);
      if (!pendingUser) {
        throw new NotFoundError('Registration session not found. Please register again.');
      }
    } else if (type === 'reset') {
      const user = await this._userRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundError('Account not found with this email.');
      }
    }

    // 3. Generate new OTP
    const otpCode = this._cryptographicService.generateOTP();

    // 4. Save OTP to Redis (overwrites old OTP)
    await this._otpRepository.save(email, otpCode, type, config.otp.ttl);

    // 5. Send OTP via email
    await this._emailService.sendOTP(email, otpCode, type);

    // 6. Return success response
    return {
      message: 'Verification code resent to your email',
      email,
    };
  }
}
