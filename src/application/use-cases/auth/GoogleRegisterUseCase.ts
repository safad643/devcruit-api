import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import { IUserRepository } from '../../../domain/repositories';
import { IGoogleAuthService, IAuthTokenService } from '../../services';
import { User } from '../../../domain/entities/User';
import { ConflictError, ValidationError } from '../../../domain/errors';
import { GoogleRegisterInput, GoogleRegisterOutput } from '../../dtos/auth.dto';
import { IGoogleRegisterUseCase } from './interfaces';

@injectable()
export class GoogleRegisterUseCase implements IGoogleRegisterUseCase {
  constructor(
    @inject(TYPES.GoogleAuthService) private googleAuthService: IGoogleAuthService,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.AuthTokenService) private authTokenService: IAuthTokenService
  ) { }

  async execute(input: GoogleRegisterInput): Promise<GoogleRegisterOutput> {
    // 1. Exchange code for Google access token
    const googleAccessToken = await this.googleAuthService.exchangeCodeForTokens(input.code);

    // 2. Get user info from Google (this validates email_verified internally)
    const googleUser = await this.googleAuthService.getUserInfo(googleAccessToken);

    // 3. Check for existing user
    const existingUser = await this.userRepository.findByEmail(googleUser.email);

    if (existingUser) {
      // User exists with local auth - link Google account
      if (existingUser.hasAuthProvider('local') && !existingUser.hasAuthProvider('google')) {
        await this.userRepository.update(existingUser.id, existingUser.withGoogleLink(googleUser.sub));

        // Refetch to get updated user
        const updatedUser = await this.userRepository.findById(existingUser.id);
        if (!updatedUser) {
          throw new ValidationError('Failed to link Google account');
        }

        // Generate tokens and build auth response
        return await this.authTokenService.generateAuthResponse(updatedUser);
      }

      // User already has Google auth
      if (existingUser.hasAuthProvider('google')) {
        throw new ConflictError('An account with this email already exists. Please login instead.');
      }
    }

    // 4. Create new user with Google auth
    const userProps = User.create({
      email: googleUser.email,
      name: googleUser.name || googleUser.email.split('@')[0], // Use Google name or fallback to email prefix
      password: null,
      role: input.role,
      authProviders: ['google'],
      googleId: googleUser.sub,
    });

    const newUser = await this.userRepository.create(userProps);

    // 5. Generate tokens and build auth response
    return await this.authTokenService.generateAuthResponse(newUser);
  }
}
