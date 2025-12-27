import { IUserRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError } from '../../../domain/errors';
import { UnblockUserInput, UnblockUserOutput } from '../../dtos/admin.dto';
import { IEmailService } from '../../services';
@injectable()
export class UnblockUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService
  ) { }

  async execute(input: UnblockUserInput): Promise<UnblockUserOutput> {
    // 1. Verify user exists
    const user = await this._userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Unblock the user
    await this._userRepository.update(input.userId, user.unblock());

    // 3. Notify user via email
    this._emailService.sendUserUnblocked(user.email);

    return {
      userId: input.userId,
      message: 'User unblocked successfully',
    };
  }
}

