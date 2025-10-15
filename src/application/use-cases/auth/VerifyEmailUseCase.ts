import { IUserRepository, IPendingUserRepository, IOTPRepository, IRefreshTokenRepository } from '../../../domain/repositories';
import { ITokenService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { User } from '../../../domain/entities/User';
import { VerifyEmailInput, AuthTokensOutput } from '../../dtos/auth.dto';
import { UnauthorizedError, NotFoundError } from '../../../domain/errors';
import { config } from '../../../config';

@injectable()
export class VerifyEmailUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.PendingUserRepository) private pendingUserRepository: IPendingUserRepository,
    @inject(TYPES.OTPRepository) private otpRepository: IOTPRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.TokenService) private tokenService: ITokenService
  ) {}

  async execute(input: VerifyEmailInput): Promise<AuthTokensOutput> {
    // 1. Get pending user data
    const pendingUser = await this.pendingUserRepository.findByEmail(input.email);
    if (!pendingUser) {
      throw new NotFoundError('Registration session expired or not found');
    }

    // 2. Verify OTP
    const storedOtp = await this.otpRepository.find(input.email, 'register');
    if (!storedOtp) {
      throw new UnauthorizedError('Verification code expired');
    }

    if (storedOtp !== input.otpCode) {
      throw new UnauthorizedError('Invalid verification code');
    }

    // 3. Create user in database
    const userProps = User.create({
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
    });
    
    const user = await this.userRepository.create(userProps);

    // 4. Clean up Redis (pending user and OTP)
    await Promise.all([
      this.pendingUserRepository.delete(input.email),
      this.otpRepository.delete(input.email, 'register'),
    ]);

    // 5. Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const { token: refreshToken, tokenId } = this.tokenService.generateRefreshToken({
      userId: user.id,
      role: user.role,
    });

    // 6. Save refresh token to Redis
    await this.refreshTokenRepository.save(
        tokenId,
        user.id,
        config.jwt.refreshTokenExpiry
      );

    // 7. Return tokens and user data
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
