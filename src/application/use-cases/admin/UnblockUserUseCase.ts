import { IUserRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError } from '../../../domain/errors';
import { UnblockUserInput, UnblockUserOutput } from '../../dtos/admin.dto';

@injectable()
export class UnblockUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(input: UnblockUserInput): Promise<UnblockUserOutput> {
    // 1. Verify user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Unblock the user
    await this.userRepository.unblockUser(input.userId);

    return {
      userId: input.userId,
      message: 'User unblocked successfully',
    };
  }
}

