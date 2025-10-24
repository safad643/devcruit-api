import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import { IUserRepository, IRefreshTokenRepository } from '../../../domain/repositories';
import { IGoogleAuthService, ITokenService } from '../../services';
import { User } from '../../../domain/entities/User';
import { ConflictError, ValidationError } from '../../../domain/errors';
import { UserRole } from '../../../domain/types';
import { config } from '../../../config';

export interface GoogleRegisterInput {
  code: string;
  role: UserRole;
}

export interface GoogleRegisterOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@injectable()
export class GoogleRegisterUseCase {
  constructor(
    @inject(TYPES.GoogleAuthService) private googleAuthService: IGoogleAuthService,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.TokenService) private tokenService: ITokenService
  ) {}

  async execute(input: GoogleRegisterInput): Promise<GoogleRegisterOutput> {
    // 1. Exchange code for Google access token
    const googleAccessToken = await this.googleAuthService.exchangeCodeForTokens(input.code);
    
    // 2. Get user info from Google (this validates email_verified internally)
    const googleUser = await this.googleAuthService.getUserInfo(googleAccessToken);

    // 3. Check for existing user
    const existingUser = await this.userRepository.findByEmail(googleUser.email);

    if (existingUser) {
      // User exists with local auth - link Google account
      if (existingUser.hasAuthProvider('local') && !existingUser.hasAuthProvider('google')) {
        await this.userRepository.linkGoogleAccount(existingUser.id, googleUser.sub);

        // Refetch to get updated user
        const updatedUser = await this.userRepository.findById(existingUser.id);
        if (!updatedUser) {
          throw new ValidationError('Failed to link Google account');
        }

        // Generate tokens
        const accessToken = this.tokenService.generateAccessToken({
          userId: updatedUser.id,
          role: updatedUser.role,
          email: updatedUser.email,
        });

        const { token: refreshToken, tokenId } = this.tokenService.generateRefreshToken({
          userId: updatedUser.id,
          role: updatedUser.role,
          email: updatedUser.email,
        });

        await this.refreshTokenRepository.save(
          tokenId,
          updatedUser.id,
          config.jwt.refreshTokenExpiry
        );

        return {
          accessToken,
          refreshToken,
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
          },
        };
      }

      // User already has Google auth
      if (existingUser.hasAuthProvider('google')) {
        throw new ConflictError('An account with this email already exists. Please login instead.');
      }
    }

    // 4. Create new user with Google auth
    const userProps = User.create({
      email: googleUser.email,
      password: null,
      role: input.role,
      authProviders: ['google'],
      googleId: googleUser.sub,
    });

    const newUser = await this.userRepository.create(userProps);

    // 5. Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: newUser.id,
      role: newUser.role,
      email: newUser.email,
    });

    const { token: refreshToken, tokenId } = this.tokenService.generateRefreshToken({
      userId: newUser.id,
      role: newUser.role,
      email: newUser.email,
    });

    await this.refreshTokenRepository.save(
      tokenId,
      newUser.id,
      config.jwt.refreshTokenExpiry
    );

    // 6. Return tokens and user data
    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }
}
