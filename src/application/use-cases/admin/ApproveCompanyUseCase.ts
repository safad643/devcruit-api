import { ICompanyProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ValidationError } from '../../../domain/errors';
import { ApproveCompanyInput, ApproveCompanyOutput } from '../../dtos/admin.dto';

@injectable()
export class ApproveCompanyUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository
  ) { }

  async execute(input: ApproveCompanyInput): Promise<ApproveCompanyOutput> {
    // 1. Verify company profile exists
    const existingProfile = await this._companyProfileRepository.findById(input.companyId);
    if (!existingProfile) {
      throw new NotFoundError('Company profile not found');
    }

    // 2. Check if profile is already approved
    if (existingProfile.status === 'approved') {
      throw new ValidationError('Company profile is already approved');
    }

    // 3. Approve the company profile
    const approvedProfile = await this._companyProfileRepository.update(input.companyId, existingProfile.approve());

    return {
      companyId: approvedProfile.id,
      userId: approvedProfile.userId,
      message: 'Company profile approved successfully',
    };
  }
}

