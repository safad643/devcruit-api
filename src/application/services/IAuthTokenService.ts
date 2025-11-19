import { User } from '../../domain/entities/User';
import { AuthTokensOutput } from '../dtos/auth.dto';

export interface IAuthTokenService {
  /**
   * Generates access and refresh tokens, saves refresh token, and builds auth response
   * with company profile information if applicable.
   */
  generateAuthResponse(user: User): Promise<AuthTokensOutput>;
}

