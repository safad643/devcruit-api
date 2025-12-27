import { ICompanyProfileRepository, IUserRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { CreateCompanyProfileInput, CreateCompanyProfileOutput } from '../../dtos/profile.dto';
import { NotFoundError, ValidationError } from '../../../domain/errors';
import { CompanyProfile } from '../../../domain/entities/CompanyProfile';

@injectable()
export class CreateCompanyProfileUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private _profileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository
  ) { }

  async execute(input: CreateCompanyProfileInput): Promise<CreateCompanyProfileOutput> {
    // 1. Verify user exists
    const user = await this._userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Check if user is a company
    if (user.role !== 'company') {
      throw new ValidationError('Only company users can create a company profile');
    }

    // 3. Check if profile already exists
    const existingProfile = await this._profileRepository.findByUserId(input.userId);
    if (existingProfile) {
      throw new ValidationError('A company profile already exists for this user');
    }

    // 4. Create the profile
    const profile = CompanyProfile.create({
      userId: input.userId,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      companyName: input.companyName,
      companyWebsite: input.companyWebsite,
      companySize: input.companySize,
      businessRegistrationNumber: input.businessRegistrationNumber,
      businessAddress: input.businessAddress,
      businessRegistrationProofUrl: input.businessRegistrationProofUrl,
      employmentVerificationUrl: input.employmentVerificationUrl,
      logoUrl: input.logoUrl,
    });

    // 5. Save to database
    const createdProfile = await this._profileRepository.create(profile);

    // 6. Mark user's profile as completed
    await this._userRepository.update(input.userId, user.withProfileCompleted(true));

    return {
      id: createdProfile.id,
      userId: createdProfile.userId,
      message: 'Company profile created successfully',
    };
  }
}


