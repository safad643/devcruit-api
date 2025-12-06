import { IDeveloperProfileRepository, IUserRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { CreateDeveloperProfileInput, CreateDeveloperProfileOutput } from '../../dtos/profile.dto';
import { NotFoundError, ValidationError } from '../../../domain/errors';
import { DeveloperProfile } from '../../../domain/entities/DeveloperProfile';
import { DateValidator } from '../../validators/date-validator';

@injectable()
export class CreateDeveloperProfileUseCase {
  constructor(
    @inject(TYPES.DeveloperProfileRepository) private profileRepository: IDeveloperProfileRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) { }

  async execute(input: CreateDeveloperProfileInput): Promise<CreateDeveloperProfileOutput> {

    // 1. Verify user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Check if user is a developer
    if (user.role !== 'developer') {
      throw new ValidationError('Only developers can create a developer profile');
    }

    // 3. Check if profile already exists
    const existingProfile = await this.profileRepository.findByUserId(input.userId);
    if (existingProfile) {
      throw new ValidationError('A developer profile already exists for this user');
    }

    // 3.5. Validate work history dates
    if (input.workHistory && input.workHistory.length > 0) {
      DateValidator.validateWorkHistoryDates(input.workHistory);
    }

    // 4. Create the profile
    const profile = DeveloperProfile.create({
      userId: input.userId,
      profilePhotoUrl: input.profilePhotoUrl,
      bio: input.bio,
      skills: input.skills,
      techs: input.techs,
      workHistory: input.workHistory,
      employmentStatus: input.employmentStatus,
      education: input.education,
      certifications: input.certifications,
      githubUrl: input.githubUrl,
      portfolioUrl: input.portfolioUrl,
      projects: input.projects,
      linkedinUrl: input.linkedinUrl,
      desiredSalary: input.desiredSalary,
      jobTypePreferences: input.jobTypePreferences,
      workArrangement: input.workArrangement,
      yearsExperience: input.yearsExperience,
      seniorityLevel: input.seniorityLevel,
      willingToRelocate: input.willingToRelocate,
      resumeUrl: input.resumeUrl,
    });

    // 5. Save to database
    const createdProfile = await this.profileRepository.create(profile);

    // 6. Mark user's profile as completed
    await this.userRepository.updateProfileCompletedStatus(input.userId, true);

    return {
      id: createdProfile.id,
      userId: createdProfile.userId,
      message: 'Developer profile created successfully',
    };
  }
}

