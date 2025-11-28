import { IRefreshTokenRepository } from '../../../domain/repositories';
import { ITokenService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { RefreshTokenInput, RefreshTokenOutput } from '../../dtos/auth.dto';
import { UnauthorizedError } from '../../../domain/errors';
import { config } from '../../../config';
import { IRefreshTokenUseCase } from './interfaces';

@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.TokenService) private tokenService: ITokenService
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    if (!input.refreshToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    // 1. Verify and decode refresh token JWT
    const decoded = this.tokenService.verifyRefreshToken(input.refreshToken);

    // 2. Check if token exists in Redis (whitelist check)
    const exists = await this.refreshTokenRepository.exists(decoded.tokenId);
    if (!exists) {
      throw new UnauthorizedError('Refresh token has been revoked or expired.');
    }

    // 3. Generate new access token
    const accessToken = this.tokenService.generateAccessToken({
      userId: decoded.userId,
      role: decoded.role,
    });

    // 4. Generate new refresh token
    const { token: newRefreshToken, tokenId: newTokenId } = this.tokenService.generateRefreshToken({
      userId: decoded.userId,
      role: decoded.role,
    });

    // 5. Delete old refresh token from Redis (rotation)
    await this.refreshTokenRepository.delete(decoded.tokenId, decoded.userId);

    // 6. Save new refresh token to Redis
    await this.refreshTokenRepository.save(
      newTokenId,
      decoded.userId,
      config.jwt.refreshTokenExpiry
    );

    // 7. Return new token pair
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
