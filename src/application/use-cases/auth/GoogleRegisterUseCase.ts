import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import { IUserRepository, IRefreshTokenRepository, ICompanyProfileRepository } from '../../../domain/repositories';
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
    isProfileCompleted: boolean;
    status?: 'pending' | 'approved' | 'rejected' | 'resubmitted' | 'paid';
  };
}

import { IGoogleRegisterUseCase } from './interfaces';

@injectable()
export class GoogleRegisterUseCase implements IGoogleRegisterUseCase {
  constructor(
    @inject(TYPES.GoogleAuthService) private googleAuthService: IGoogleAuthService,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.TokenService) private tokenService: ITokenService,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository
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
          role: updatedUser.role
        });

        const { token: refreshToken, tokenId } = this.tokenService.generateRefreshToken({
          userId: updatedUser.id,
          role: updatedUser.role
        });

        await this.refreshTokenRepository.save(
          tokenId,
          updatedUser.id,
          config.jwt.refreshTokenExpiry
        );

        // Get company profile status if user is a company
        let status: 'pending' | 'approved' | 'rejected' | 'resubmitted' | 'paid' | undefined;
        if (updatedUser.role === 'company') {
          const companyProfile = await this.companyProfileRepository.findByUserId(updatedUser.id);
          if (companyProfile) {
            status = companyProfile.status;
          }
        }

        return {
          accessToken,
          refreshToken,
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            isProfileCompleted: updatedUser.isProfileCompleted,
            ...(status && { status }),
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
      role: newUser.role
    });

    const { token: refreshToken, tokenId } = this.tokenService.generateRefreshToken({
      userId: newUser.id,
      role: newUser.role
    });

    await this.refreshTokenRepository.save(
      tokenId,
      newUser.id,
      config.jwt.refreshTokenExpiry
    );

    // 6. Get company profile status if user is a company
    let status: 'pending' | 'approved' | 'rejected' | 'resubmitted' | 'paid' | undefined;
    if (newUser.role === 'company') {
      const companyProfile = await this.companyProfileRepository.findByUserId(newUser.id);
      if (companyProfile) {
        status = companyProfile.status;
      }
    }

    // 7. Return tokens and user data
    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isProfileCompleted: newUser.isProfileCompleted,
        ...(status && { status }),
      },
    };
  }
}
