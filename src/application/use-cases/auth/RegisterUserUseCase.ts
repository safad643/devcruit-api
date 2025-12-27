import { IUserRepository, IPendingUserRepository, IOTPRepository } from '../../../domain/repositories';
import { IHashService, IEmailService, ICryptographicService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { RegisterUserInput, RegisterUserOutput } from '../../dtos/auth.dto';
import { ConflictError } from '../../../domain/errors';
import { PasswordValidator } from '../../validators/PasswordValidator';
import { config } from '../../../config';
import { IRegisterUserUseCase } from './interfaces';

@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.PendingUserRepository) private _pendingUserRepository: IPendingUserRepository,
    @inject(TYPES.OTPRepository) private _otpRepository: IOTPRepository,
    @inject(TYPES.HashService) private _hashService: IHashService,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.CryptographicService) private _cryptographicService: ICryptographicService
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // 1. Validate password
    PasswordValidator.validate(input.password);

    // 2. Check if user already exists
    const existingUser = await this._userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // 3. Hash password
    const hashedPassword = await this._hashService.hash(input.password);

    // 4. Save pending user to Redis (overwrites if exists)
    await this._pendingUserRepository.save(
      input.email,
      {
        email: input.email,
        name: input.name,
        password: hashedPassword,
        role: input.role,
      },
      config.pendingUser.ttl
    );

    // 5. Generate OTP
    const otpCode = this._cryptographicService.generateOTP();

    // 6. Save OTP to Redis
    await this._otpRepository.save(input.email, otpCode, 'register', config.otp.ttl);

    // 7. Send OTP via email
    await this._emailService.sendOTP(input.email, otpCode, 'register');

    // 8. Return success response
    return {
      message: 'Verification code sent to your email',
      email: input.email,
    };
  }
}
