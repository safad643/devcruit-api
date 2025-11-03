import { IUserRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError } from '../../../domain/errors';
import { BlockUserInput, BlockUserOutput } from '../../dtos/admin.dto';
import { IEmailService } from '../../services';

@injectable()
export class BlockUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService
  ) {}

  async execute(input: BlockUserInput): Promise<BlockUserOutput> {
    // 1. Verify user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Block the user
    await this.userRepository.blockUser(input.userId);

    // 3. Notify user via email
     this.emailService.sendUserBlocked(user.email);

    return {
      userId: input.userId,
      message: 'User blocked successfully',
    };
  }
}

