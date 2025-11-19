import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { IAuthTokenService } from '../../application/services/IAuthTokenService';
import { ITokenService } from '../../application/services';
import { IRefreshTokenRepository, ICompanyProfileRepository } from '../../domain/repositories';
import { User } from '../../domain/entities/User';
import { AuthTokensOutput } from '../../application/dtos/auth.dto';
import { CompanyDocumentKey } from '../../domain/types';
import { config } from '../../config';

@injectable()
export class AuthTokenService implements IAuthTokenService {
  constructor(
    @inject(TYPES.TokenService) private tokenService: ITokenService,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository
  ) {}

  async generateAuthResponse(user: User): Promise<AuthTokensOutput> {
    // 1. Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const { token: refreshToken, tokenId } = this.tokenService.generateRefreshToken({
      userId: user.id,
      role: user.role,
    });

    // 2. Save refresh token to Redis
    await this.refreshTokenRepository.save(
      tokenId,
      user.id,
      config.jwt.refreshTokenExpiry
    );

    // 3. Get company profile status if user is a company
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

    // 4. Return tokens and user data
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isProfileCompleted: user.isProfileCompleted,
        ...(status && { status }),
        ...(neededDocuments && { neededDocuments }),
      },
    };
  }
}

