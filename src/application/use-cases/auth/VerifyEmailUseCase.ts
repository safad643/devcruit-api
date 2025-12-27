import { IUserRepository, IPendingUserRepository, IOTPRepository } from '../../../domain/repositories';
import { IAuthTokenService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { User } from '../../../domain/entities/User';
import { VerifyEmailInput, AuthTokensOutput } from '../../dtos/auth.dto';
import { UnauthorizedError, NotFoundError } from '../../../domain/errors';
import { IVerifyEmailUseCase } from './interfaces';

@injectable()
export class VerifyEmailUseCase implements IVerifyEmailUseCase {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.PendingUserRepository) private _pendingUserRepository: IPendingUserRepository,
    @inject(TYPES.OTPRepository) private _otpRepository: IOTPRepository,
    @inject(TYPES.AuthTokenService) private _authTokenService: IAuthTokenService
  ) {}

  async execute(input: VerifyEmailInput): Promise<AuthTokensOutput> {
    // 1. Get pending user data
    const pendingUser = await this._pendingUserRepository.findByEmail(input.email);
    if (!pendingUser) {
      throw new NotFoundError('Registration session expired or not found');
    }

    // 2. Verify OTP
    const storedOtp = await this._otpRepository.find(input.email, 'register');
    if (!storedOtp) {
      throw new UnauthorizedError('Verification code expired');
    }

    if (storedOtp !== input.otpCode) {
      throw new UnauthorizedError('Invalid verification code');
    }

    // 3. Create user in database
    if (!pendingUser.password) {
      throw new UnauthorizedError('Registration session missing password');
    }

    const userProps = User.create({
      email: pendingUser.email,
      name: pendingUser.name,
      password: pendingUser.password,
      role: pendingUser.role,
      authProviders: ['local'], // Default to local auth provider for email signup
    });
    
    const user = await this._userRepository.create(userProps);

    // 4. Clean up Redis (pending user and OTP)
    await Promise.all([
      this._pendingUserRepository.delete(input.email),
      this._otpRepository.delete(input.email, 'register'),
    ]);

    // 5. Generate tokens and build auth response
    return await this._authTokenService.generateAuthResponse(user);
  }
}
