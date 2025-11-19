import { IDeveloperProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { UpdateDeveloperProfileInput, UpdateDeveloperProfileOutput } from '../../dtos/profile.dto';
import { NotFoundError } from '../../../domain/errors';
import { DeveloperProfileProps } from '../../../domain/entities/DeveloperProfile';

@injectable()
export class UpdateDeveloperProfileUseCase {
  constructor(
    @inject(TYPES.DeveloperProfileRepository) private profileRepository: IDeveloperProfileRepository
  ) {}

  async execute(userId: string, input: UpdateDeveloperProfileInput): Promise<UpdateDeveloperProfileOutput> {
    // 1. Verify profile exists
    const existingProfile = await this.profileRepository.findByUserId(userId);
    if (!existingProfile) {
      throw new NotFoundError('Developer profile not found');
    }

    // 2. Prepare update data - filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined)
    ) as Partial<DeveloperProfileProps>;

    // 3. Update the profile
    const updatedProfile = await this.profileRepository.update(userId, updateData);

    return {
      id: updatedProfile.id,
      message: 'Developer profile updated successfully',
    };
  }
}

