import { IAdminRepository, IRefreshTokenRepository } from '../../../domain/repositories';
import { IHashService, ITokenService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { LoginInput, AdminAuthTokensOutput } from '../../dtos/auth.dto';
import { UnauthorizedError } from '../../../domain/errors';
import { config } from '../../../config';
import { IAdminLoginUseCase } from './interfaces';

@injectable()
export class AdminLoginUseCase implements IAdminLoginUseCase {
  constructor(
    @inject(TYPES.AdminRepository) private _adminRepository: IAdminRepository,
    @inject(TYPES.RefreshTokenRepository) private _refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.HashService) private _hashService: IHashService,
    @inject(TYPES.TokenService) private _tokenService: ITokenService
  ) {}

  async execute(input: LoginInput): Promise<AdminAuthTokensOutput> {
    const admin = await this._adminRepository.findByEmail(input.email);
    if (!admin) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await this._hashService.compare(input.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = this._tokenService.generateAccessToken({
      userId: admin.id,
      role: admin.role
    });

    const { token: refreshToken, tokenId } = this._tokenService.generateRefreshToken({
      userId: admin.id,
      role: admin.role
    });

    await this._refreshTokenRepository.save(
      tokenId,
      admin.id,
      config.jwt.refreshTokenExpiry
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}


