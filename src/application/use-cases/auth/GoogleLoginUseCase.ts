import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import { IUserRepository } from '../../../domain/repositories';
import { IGoogleAuthService, IAuthTokenService } from '../../services';
import { UnauthorizedError, ForbiddenError } from '../../../domain/errors';
import { GoogleLoginInput, GoogleLoginOutput } from '../../dtos/auth.dto';
import { IGoogleLoginUseCase } from './interfaces';

@injectable()
export class GoogleLoginUseCase implements IGoogleLoginUseCase {
  constructor(
    @inject(TYPES.GoogleAuthService) private googleAuthService: IGoogleAuthService,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.AuthTokenService) private authTokenService: IAuthTokenService
  ) { }

  async execute(input: GoogleLoginInput): Promise<GoogleLoginOutput> {
    // 1. Exchange code for Google access token
    const googleAccessToken = await this.googleAuthService.exchangeCodeForTokens(input.code);

    // 2. Get user info from Google
    const googleUser = await this.googleAuthService.getUserInfo(googleAccessToken);

    // 3. Find existing user by email
    let user = await this.userRepository.findByEmail(googleUser.email);

    if (!user) {
      throw new UnauthorizedError('No account found with this email. Please register first.');
    }

    // 4. Check if user is blocked
    if (user.isBlocked) {
      throw new ForbiddenError('Your account has been blocked. Contact support.');
    }

    // 5. Link Google account if not already linked
    if (!user.hasAuthProvider('google')) {
      await this.userRepository.update(user.id, user.withGoogleLink(googleUser.sub));

      // Refetch user to get updated data
      user = await this.userRepository.findById(user.id);
      if (!user) {
        throw new UnauthorizedError('Failed to update user account');
      }
    }

    // 6. Generate tokens and build auth response
    return await this.authTokenService.generateAuthResponse(user);
  }
}
