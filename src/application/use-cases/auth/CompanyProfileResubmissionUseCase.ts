import { ICompanyProfileRepository, IUserRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { CompanyProfileResubmissionInput, CompanyProfileResubmissionOutput } from '../../dtos/auth.dto';
import { NotFoundError, ValidationError } from '../../../domain/errors';
import { CompanyProfileProps } from '../../../domain/entities/CompanyProfile';

@injectable()
export class CompanyProfileResubmissionUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private profileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(input: CompanyProfileResubmissionInput): Promise<CompanyProfileResubmissionOutput> {
    // 1. Verify user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Check if user is a company
    if (user.role !== 'company') {
      throw new ValidationError('Only company users can resubmit a company profile');
    }

    // 3. Check if profile exists
    const existingProfile = await this.profileRepository.findByUserId(input.userId);
    if (!existingProfile) {
      throw new NotFoundError('Company profile not found');
    }

    // 4. Check if profile status is 'rejected' (required for resubmission)
    if (existingProfile.status !== 'rejected') {
      throw new ValidationError('Profile can only be resubmitted if it is currently rejected');
    }

    // 5. Prepare update payload (remove userId, only include provided fields)
    const { userId, ...updateFields } = input;
    const updates: Partial<CompanyProfileProps> = {
      ...updateFields,
      status: 'resubmitted', // Automatically set status to resubmitted
    };

    // 6. Update the profile
    const updatedProfile = await this.profileRepository.update(userId, updates);

    return {
      id: updatedProfile.id,
      userId: updatedProfile.userId,
      message: 'Company profile resubmitted successfully',
    };
  }
}

