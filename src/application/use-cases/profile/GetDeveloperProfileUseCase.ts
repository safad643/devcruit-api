import { IDeveloperProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { GetDeveloperProfileOutput } from '../../dtos/profile.dto';
import { NotFoundError } from '../../../domain/errors';

@injectable()
export class GetDeveloperProfileUseCase {
  constructor(
    @inject(TYPES.DeveloperProfileRepository) private _profileRepository: IDeveloperProfileRepository
  ) {}

  async execute(userId: string): Promise<GetDeveloperProfileOutput> {
    const profile = await this._profileRepository.findByUserId(userId);
    
    if (!profile) {
      throw new NotFoundError('Developer profile not found');
    }

    return {
      id: profile.id,
      userId: profile.userId,
      profilePhotoUrl: profile.profilePhotoUrl,
      bio: profile.bio,
      skills: profile.skills,
      techs: profile.techs,
      workHistory: profile.workHistory,
      employmentStatus: profile.employmentStatus,
      education: profile.education,
      certifications: profile.certifications,
      githubUrl: profile.githubUrl,
      portfolioUrl: profile.portfolioUrl,
      projects: profile.projects,
      linkedinUrl: profile.linkedinUrl,
      desiredSalary: profile.desiredSalary,
      jobTypePreferences: profile.jobTypePreferences,
      workArrangement: profile.workArrangement,
      yearsExperience: profile.yearsExperience,
      seniorityLevel: profile.seniorityLevel,
      willingToRelocate: profile.willingToRelocate,
      resumeUrl: profile.resumeUrl,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}

