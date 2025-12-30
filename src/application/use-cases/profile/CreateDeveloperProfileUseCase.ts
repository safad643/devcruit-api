import { IDeveloperProfileRepository, IUserRepository, IJobFieldRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { CreateDeveloperProfileInput, CreateDeveloperProfileOutput } from '../../dtos/profile.dto';
import { NotFoundError, ValidationError } from '../../../domain/errors';
import { DeveloperProfile } from '../../../domain/entities/DeveloperProfile';
import { DateValidator } from '../../validators/date-validator';

@injectable()
export class CreateDeveloperProfileUseCase {
  constructor(
    @inject(TYPES.DeveloperProfileRepository) private _profileRepository: IDeveloperProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.JobFieldRepository) private _jobFieldRepository: IJobFieldRepository
  ) { }

  async execute(input: CreateDeveloperProfileInput): Promise<CreateDeveloperProfileOutput> {

    // 1. Verify user exists
    const user = await this._userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Check if user is a developer
    if (user.role !== 'developer') {
      throw new ValidationError('Only developers can create a developer profile');
    }

    // 3. Check if profile already exists
    const existingProfile = await this._profileRepository.findByUserId(input.userId);
    if (existingProfile) {
      throw new ValidationError('A developer profile already exists for this user');
    }

    // 3.5. Validate work history dates
    if (input.workHistory && input.workHistory.length > 0) {
      DateValidator.validateWorkHistoryDates(input.workHistory);
    }

    // 3.6. Validate education dates
    if (input.education && input.education.length > 0) {
      DateValidator.validateEducationDates(input.education);
    }



    // 3.8. Validate skills exist in JobField table
    if (input.skills && input.skills.length > 0) {
      const missingSkills = await this._jobFieldRepository.findMissingNames('skill', input.skills);
      if (missingSkills.length > 0) {
        throw new ValidationError(`Invalid skills: ${missingSkills.join(', ')}`);
      }
    }

    // 3.9. Validate techs exist in JobField table
    if (input.techs && input.techs.length > 0) {
      const missingTechs = await this._jobFieldRepository.findMissingNames('tech', input.techs);
      if (missingTechs.length > 0) {
        throw new ValidationError(`Invalid technologies: ${missingTechs.join(', ')}`);
      }
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
    const createdProfile = await this._profileRepository.create(profile);

    // 6. Mark user's profile as completed
    await this._userRepository.update(input.userId, user.withProfileCompleted(true));

    return {
      id: createdProfile.id,
      userId: createdProfile.userId,
      message: 'Developer profile created successfully',
    };
  }
}

