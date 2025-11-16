import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { ITokenService, TokenPayload } from '../../application/services';
import { config } from '../../config';
import { UnauthorizedError, InternalError } from '../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class TokenService implements ITokenService {
  generateAccessToken(payload: TokenPayload): string {
    try {
      return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.accessTokenExpiry,
      });
    } catch (error) {
      throw new InternalError('Failed to generate access token', error as Error);
    }
  }

  generateRefreshToken(payload: TokenPayload): { token: string; tokenId: string } {
    try {
      const tokenId = randomBytes(32).toString('hex');
      
      const token = jwt.sign(
        { ...payload, jti: tokenId },
        config.jwt.secret,
        { expiresIn: config.jwt.refreshTokenExpiry }
      );

      return { token, tokenId };
    } catch (error) {
      throw new InternalError('Failed to generate refresh token', error as Error);
    }
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      return { userId: decoded.userId, role: decoded.role };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Invalid or expired access token');
      }
      throw new InternalError('Failed to verify access token', error as Error);
    }
  }

  verifyRefreshToken(token: string): TokenPayload & { tokenId: string } {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload & { jti: string };
      
      if (!decoded.jti) {
        throw new UnauthorizedError('Invalid refresh token format');
      }

      return {
        userId: decoded.userId,
        role: decoded.role,
        tokenId: decoded.jti,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }
      throw new InternalError('Failed to verify refresh token', error as Error);
    }
  }
}
