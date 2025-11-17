import { ICompanyProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { UpdateCompanyProfileInput, UpdateCompanyProfileOutput } from '../../dtos/profile.dto';
import { NotFoundError } from '../../../domain/errors';
import { CompanyProfileProps } from '../../../domain/entities/CompanyProfile';

@injectable()
export class UpdateCompanyProfileUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private profileRepository: ICompanyProfileRepository
  ) {}

  async execute(userId: string, input: UpdateCompanyProfileInput): Promise<UpdateCompanyProfileOutput> {
    // 1. Verify profile exists
    const existingProfile = await this.profileRepository.findByUserId(userId);
    if (!existingProfile) {
      throw new NotFoundError('Company profile not found');
    }

    // 2. Prepare update data - only include fields that are provided
    const updateData: Partial<CompanyProfileProps> = {};
    
    if (input.companyName !== undefined) updateData.companyName = input.companyName;
    if (input.companyWebsite !== undefined) updateData.companyWebsite = input.companyWebsite;
    if (input.businessAddress !== undefined) updateData.businessAddress = input.businessAddress;
    
    // 3. Update the profile
    const updatedProfile = await this.profileRepository.update(userId, updateData);

    return {
      id: updatedProfile.id,
      message: 'Company profile updated successfully',
    };
  }
}

