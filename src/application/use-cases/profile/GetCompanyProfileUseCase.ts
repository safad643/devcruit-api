import { ICompanyProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { GetCompanyProfileOutput } from '../../dtos/profile.dto';
import { NotFoundError } from '../../../domain/errors';

@injectable()
export class GetCompanyProfileUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private profileRepository: ICompanyProfileRepository
  ) {}

  async execute(userId: string): Promise<GetCompanyProfileOutput> {
    const profile = await this.profileRepository.findByUserId(userId);
    
    if (!profile) {
      throw new NotFoundError('Company profile not found');
    }

    return {
      id: profile.id,
      userId: profile.userId,
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      companyName: profile.companyName,
      companyWebsite: profile.companyWebsite,
      companySize: profile.companySize,
      businessRegistrationNumber: profile.businessRegistrationNumber,
      businessAddress: profile.businessAddress,
      businessRegistrationProofUrl: profile.businessRegistrationProofUrl,
      employmentVerificationUrl: profile.employmentVerificationUrl,
      status: profile.status,
      planHistory: profile.planHistory,
      documentReuploadRequests: profile.documentReuploadRequests,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
