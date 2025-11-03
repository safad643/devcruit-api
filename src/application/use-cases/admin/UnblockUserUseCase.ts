import { IUserRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError } from '../../../domain/errors';
import { UnblockUserInput, UnblockUserOutput } from '../../dtos/admin.dto';
import { IEmailService } from '../../services';
@injectable()
export class UnblockUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService 
  ) {}

  async execute(input: UnblockUserInput): Promise<UnblockUserOutput> {
    // 1. Verify user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Unblock the user
    await this.userRepository.unblockUser(input.userId);

    // 3. Notify user via email
     this.emailService.sendUserUnblocked(user.email);

    return {
      userId: input.userId,
      message: 'User unblocked successfully',
    };
  }
}

