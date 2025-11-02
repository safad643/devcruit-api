import { IUserRepository, IRefreshTokenRepository, ICompanyProfileRepository } from '../../../domain/repositories';
import { IHashService, ITokenService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { LoginInput, AuthTokensOutput } from '../../dtos/auth.dto';
import { UnauthorizedError, ForbiddenError } from '../../../domain/errors';
import { CompanyDocumentKey } from '../../../domain/types';
import { config } from '../../../config';

@injectable()
export class LoginUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.HashService) private hashService: IHashService,
    @inject(TYPES.TokenService) private tokenService: ITokenService,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository
  ) {}

  async execute(input: LoginInput): Promise<AuthTokensOutput> {
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 2. Check if user is blocked
    if (user.isBlocked) {
      throw new ForbiddenError('Your account has been blocked. Please contact support.');
    }

    // 3. Verify password
    if (!user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }
    
    const isPasswordValid = await this.hashService.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 4. Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
      email:user.email
    });

    const { token: refreshToken, tokenId } = this.tokenService.generateRefreshToken({
      userId: user.id,
      role: user.role,
      email:user.email
    });

    // 5. Save refresh token to Redis
    await this.refreshTokenRepository.save(
      tokenId,
      user.id,
      config.jwt.refreshTokenExpiry
    );

    // 6. Get company profile status if user is a company
    let status: 'pending' | 'approved' | 'rejected' | 'resubmitted' | 'paid' | undefined;
    let neededDocuments: Array<{ documentKey: CompanyDocumentKey; note?: string }> | undefined;
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

    // 7. Return tokens and user data
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
