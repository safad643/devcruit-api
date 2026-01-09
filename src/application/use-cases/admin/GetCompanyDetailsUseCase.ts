import { ICompanyProfileRepository, IUserRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { GetCompanyDetailsOutput } from '../../dtos/admin.dto';
import { NotFoundError } from '../../../domain/errors';

@injectable()
export class GetCompanyDetailsUseCase {
    constructor(
        @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
        @inject(TYPES.UserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(companyId: string): Promise<GetCompanyDetailsOutput> {
        // Get company profile by ID
        const profile = await this._companyProfileRepository.findById(companyId);
        if (!profile) {
            throw new NotFoundError('Company not found');
        }

        // Get user info for email and blocked status
        const user = await this._userRepository.findById(profile.userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        return {
            id: profile.id,
            userId: profile.userId,
            email: user.email,
            isBlocked: user.isBlocked,
            fullName: profile.fullName,
            phoneNumber: profile.phoneNumber,
            companyName: profile.companyName,
            companyWebsite: profile.companyWebsite,
            companySize: profile.companySize,
            businessRegistrationNumber: profile.businessRegistrationNumber,
            businessAddress: profile.businessAddress,
            businessRegistrationProofUrl: profile.businessRegistrationProofUrl,
            employmentVerificationUrl: profile.employmentVerificationUrl,
            logoUrl: profile.logoUrl,
            status: profile.status,
            hasActivePlan: profile.hasActivePlan(),
            planHistory: profile.planHistory,
            documentReuploadRequests: profile.documentReuploadRequests,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
}
