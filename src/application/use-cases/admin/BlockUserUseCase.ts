import { IUserRepository, IBlockedUserRepository, IRefreshTokenRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError } from '../../../domain/errors';
import { BlockUserInput, BlockUserOutput } from '../../dtos/admin.dto';
import { IEmailService } from '../../services';

@injectable()
export class BlockUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.BlockedUserRepository) private _blockedUserRepository: IBlockedUserRepository,
    @inject(TYPES.RefreshTokenRepository) private _refreshTokenRepository: IRefreshTokenRepository
  ) { }

  async execute(input: BlockUserInput): Promise<BlockUserOutput> {
    // 1. Verify user exists
    const user = await this._userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Block the user in MongoDB
    await this._userRepository.update(input.userId, user.block());

    // 3. Add to Redis blocked set for real-time middleware check
    await this._blockedUserRepository.add(input.userId);

    // 4. Delete all refresh tokens to invalidate existing sessions
    await this._refreshTokenRepository.deleteAllForUser(input.userId);

    // 5. Notify user via email
    this._emailService.sendUserBlocked(user.email);

    return {
      userId: input.userId,
      message: 'User blocked successfully',
    };
  }
}
