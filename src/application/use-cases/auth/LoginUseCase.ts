import { IUserRepository } from '../../../domain/repositories';
import { IHashService, IAuthTokenService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { LoginInput, AuthTokensOutput } from '../../dtos/auth.dto';
import { UnauthorizedError, ForbiddenError } from '../../../domain/errors';
import { ILoginUseCase } from './interfaces';

@injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.HashService) private _hashService: IHashService,
    @inject(TYPES.AuthTokenService) private _authTokenService: IAuthTokenService
  ) {}

  async execute(input: LoginInput): Promise<AuthTokensOutput> {
    // 1. Find user by email
    const user = await this._userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 2. Check if user is blocked
    if (user.isBlocked) {
      throw new ForbiddenError('Your account has been blocked. Please contact support.');
    }

    // 3. Verify password
    if (!user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }
    
    const isPasswordValid = await this._hashService.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 4. Generate tokens and build auth response
    return await this._authTokenService.generateAuthResponse(user);
  }
}
