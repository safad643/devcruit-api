import { IRefreshTokenRepository } from '../../../domain/repositories';
import { ITokenService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { LogoutInput, LogoutOutput } from '../../dtos/auth.dto';
import { ILogoutUseCase } from './interfaces';
import { UnauthorizedError } from '../../../domain/errors';

@injectable()
export class LogoutUseCase implements ILogoutUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepository) private _refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.TokenService) private _tokenService: ITokenService
  ) { }

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    // If no refresh token, just return success - user wants to log out anyway
    if (!input.refreshToken) {
      return {
        message: 'Logged out successfully',
      };
    }

    try {
      // 1. Verify and decode refresh token
      const decoded = this._tokenService.verifyRefreshToken(input.refreshToken);

      // 2. Delete refresh token from Redis
      await this._refreshTokenRepository.delete(decoded.tokenId, decoded.userId);
    } catch {
      // Token might be expired/invalid - that's fine for logout
    }

    // 3. Return success response
    return {
      message: 'Logged out successfully',
    };
  }
}
