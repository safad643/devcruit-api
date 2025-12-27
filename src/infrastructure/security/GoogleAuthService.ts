import axios, { AxiosError } from 'axios';
import { injectable } from 'inversify';
import { IGoogleAuthService, GoogleUserInfo } from '../../application/services/IGoogleAuthService';
import { config } from '../../config';
import { InternalError, UnauthorizedError } from '../../domain/errors';

@injectable()
export class GoogleAuthService implements IGoogleAuthService {
  private readonly _tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly _userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

  async exchangeCodeForTokens(code: string): Promise<string> {
    try {
      const response = await axios.post(this._tokenUrl, {
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.redirectUri,
        grant_type: 'authorization_code',
      });

      return response.data.access_token;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        throw new UnauthorizedError('Invalid or expired authorization code');
      }
      throw new InternalError('Failed to exchange Google authorization code', error instanceof Error ? error : undefined);
    }
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await axios.get(this._userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.data.email_verified) {
        throw new UnauthorizedError('Google email not verified');
      }

      return response.data;
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new InternalError('Failed to fetch Google user info', error instanceof Error ? error : undefined);
    }
  }
}
