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

    // 2. Prepare update data - only include fields that are provided
    const updateData: Partial<DeveloperProfileProps> = {};
    
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.skills !== undefined) updateData.skills = input.skills;
    if (input.techs !== undefined) updateData.techs = input.techs;
    if (input.workHistory !== undefined) updateData.workHistory = input.workHistory;
    if (input.employmentStatus !== undefined) updateData.employmentStatus = input.employmentStatus;
    if (input.education !== undefined) updateData.education = input.education;
    if (input.certifications !== undefined) updateData.certifications = input.certifications;
    if (input.githubUrl !== undefined) updateData.githubUrl = input.githubUrl;
    if (input.portfolioUrl !== undefined) updateData.portfolioUrl = input.portfolioUrl;
    if (input.projects !== undefined) updateData.projects = input.projects;
    if (input.linkedinUrl !== undefined) updateData.linkedinUrl = input.linkedinUrl;
    if (input.desiredSalary !== undefined) updateData.desiredSalary = input.desiredSalary;
    if (input.jobTypePreferences !== undefined) updateData.jobTypePreferences = input.jobTypePreferences;
    if (input.workArrangement !== undefined) updateData.workArrangement = input.workArrangement;
    if (input.yearsExperience !== undefined) updateData.yearsExperience = input.yearsExperience;
    if (input.seniorityLevel !== undefined) updateData.seniorityLevel = input.seniorityLevel;
    if (input.willingToRelocate !== undefined) updateData.willingToRelocate = input.willingToRelocate;
    if (input.resumeUrl !== undefined) updateData.resumeUrl = input.resumeUrl;
    if (input.profilePhotoUrl !== undefined) updateData.profilePhotoUrl = input.profilePhotoUrl;

    // 3. Update the profile
    const updatedProfile = await this.profileRepository.update(userId, updateData);

    return {
      id: updatedProfile.id,
      message: 'Developer profile updated successfully',
    };
  }
}

