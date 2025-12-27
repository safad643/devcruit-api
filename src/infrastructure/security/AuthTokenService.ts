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
    @inject(TYPES.TokenService) private _tokenService: ITokenService,
    @inject(TYPES.RefreshTokenRepository) private _refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository
  ) { }

  async generateAuthResponse(user: User): Promise<AuthTokensOutput> {
    // 1. Generate tokens
    const accessToken = this._tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const { token: refreshToken, tokenId } = this._tokenService.generateRefreshToken({
      userId: user.id,
      role: user.role,
    });

    // 2. Save refresh token to Redis
    await this._refreshTokenRepository.save(
      tokenId,
      user.id,
      config.jwt.refreshTokenExpiry
    );

    // 3. Get company profile status if user is a company
    let status: 'pending' | 'approved' | 'rejected' | 'resubmitted' | undefined;
    let hasActivePlan: boolean | undefined;
    let planExpiryDate: string | undefined;
    let neededDocuments: Array<{ documentKey: CompanyDocumentKey; note?: string }> | undefined;

    if (user.role === 'company') {
      const companyProfile = await this._companyProfileRepository.findByUserId(user.id);
      if (companyProfile) {
        status = companyProfile.status;
        hasActivePlan = companyProfile.hasActivePlan();
        // Get the expiry date of the current active plan
        const currentPlan = companyProfile.getCurrentPlan();
        if (currentPlan) {
          planExpiryDate = new Date(currentPlan.endDate).toISOString();
        }
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
        ...(hasActivePlan !== undefined && { hasActivePlan }),
        ...(planExpiryDate && { planExpiryDate }),
        ...(neededDocuments && { neededDocuments }),
      },
    };
  }
}

