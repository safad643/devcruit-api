import { IRefreshTokenRepository } from '../../../domain/repositories';
import { ITokenService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { LogoutInput, LogoutOutput } from '../../dtos/auth.dto';

@injectable()
export class LogoutUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.TokenService) private tokenService: ITokenService
  ) {}

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    // 1. Verify and decode refresh token
    const decoded = this.tokenService.verifyRefreshToken(input.refreshToken);

    // 2. Delete refresh token from Redis
    await this.refreshTokenRepository.delete(decoded.tokenId, decoded.userId);

    // 3. Return success response
    return {
      message: 'Logged out successfully',
    };
  }
}
