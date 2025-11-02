import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import { IUserRepository, IRefreshTokenRepository, ICompanyProfileRepository } from '../../../domain/repositories';
import { IGoogleAuthService, ITokenService } from '../../services';
import { UnauthorizedError, ForbiddenError } from '../../../domain/errors';
import { config } from '../../../config';

export interface GoogleLoginInput {
  code: string;
}

export interface GoogleLoginOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    isProfileCompleted: boolean;
    status?: 'pending' | 'approved' | 'rejected' | 'resubmitted' | 'paid';
    neededDocuments?: Array<{
      documentKey: string;
      note?: string;
    }>;
  };
}

@injectable()
export class GoogleLoginUseCase {
  constructor(
    @inject(TYPES.GoogleAuthService) private googleAuthService: IGoogleAuthService,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.TokenService) private tokenService: ITokenService,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository
  ) {}

  async execute(input: GoogleLoginInput): Promise<GoogleLoginOutput> {
    // 1. Exchange code for Google access token
    const googleAccessToken = await this.googleAuthService.exchangeCodeForTokens(input.code);
    
    // 2. Get user info from Google
    const googleUser = await this.googleAuthService.getUserInfo(googleAccessToken);

    // 3. Find existing user by email
    let user = await this.userRepository.findByEmail(googleUser.email);

    if (!user) {
      throw new UnauthorizedError('No account found with this email. Please register first.');
    }

    // 4. Check if user is blocked
    if (user.isBlocked) {
      throw new ForbiddenError('Your account has been blocked. Contact support.');
    }

    // 5. Link Google account if not already linked
    if (!user.hasAuthProvider('google')) {
      // linkGoogleAccount already adds 'google' to authProviders
      await this.userRepository.linkGoogleAccount(user.id, googleUser.sub);
      
      // Refetch user to get updated data
      user = await this.userRepository.findById(user.id);
      if (!user) {
        throw new UnauthorizedError('Failed to update user account');
      }
    }

    // 6. Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    const { token: refreshToken, tokenId } = this.tokenService.generateRefreshToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // 7. Save refresh token to Redis (7 days in seconds)
    await this.refreshTokenRepository.save(
      tokenId,
      user.id,
      config.jwt.refreshTokenExpiry
    );

    // 8. Get company profile status if user is a company
    let status: 'pending' | 'approved' | 'rejected' | 'resubmitted' | 'paid' | undefined;
    let neededDocuments: Array<{ documentKey: string; note?: string }> | undefined;
    if (user.role === 'company') {
      const companyProfile = await this.companyProfileRepository.findByUserId(user.id);
      if (companyProfile) {
        status = companyProfile.status;
        // If company is rejected, include the needed documents from the latest reupload request
        if (status === 'rejected' && companyProfile.documentReuploadRequests.length > 0) {
          const latestRequest = companyProfile.documentReuploadRequests[companyProfile.documentReuploadRequests.length - 1];
          neededDocuments = latestRequest.documents;
        }
      }
    }

    // 9. Return tokens and user data
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isProfileCompleted: user.isProfileCompleted,
        ...(status && { status }),
        ...(neededDocuments && { neededDocuments }),
      },
    };
  }
}
