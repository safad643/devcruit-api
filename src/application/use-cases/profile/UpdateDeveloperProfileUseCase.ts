import { IDeveloperProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { UpdateDeveloperProfileInput, UpdateDeveloperProfileOutput } from '../../dtos/profile.dto';
import { NotFoundError } from '../../../domain/errors';
import { DeveloperProfileProps } from '../../../domain/entities/DeveloperProfile';
import { DateValidator } from '../../validators/date-validator';

@injectable()
export class UpdateDeveloperProfileUseCase {
  constructor(
    @inject(TYPES.DeveloperProfileRepository) private profileRepository: IDeveloperProfileRepository
  ) { }

  async execute(userId: string, input: UpdateDeveloperProfileInput): Promise<UpdateDeveloperProfileOutput> {
    // 1. Verify profile exists
    const existingProfile = await this.profileRepository.findByUserId(userId);
    if (!existingProfile) {
      throw new NotFoundError('Developer profile not found');
    }

    // 1.5. Validate work history dates if updating work history
    if (input.workHistory && input.workHistory.length > 0) {
      DateValidator.validateWorkHistoryDates(input.workHistory);
    }

    // 2. Prepare update data
    const updateData = { ...input } as Partial<DeveloperProfileProps>;

    // 3. Update the profile
    const updatedProfile = await this.profileRepository.update(existingProfile.id, updateData);

    return {
      id: updatedProfile.id,
      message: 'Developer profile updated successfully',
    };
  }
}

