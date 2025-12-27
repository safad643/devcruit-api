import { ICompanyProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ValidationError } from '../../../domain/errors';
import { DocumentReuploadRequest } from '../../../domain/entities/CompanyProfile';
import { RejectCompanyInput, RejectCompanyOutput } from '../../dtos/admin.dto';

@injectable()
export class RejectCompanyUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository
  ) { }

  async execute(input: RejectCompanyInput): Promise<RejectCompanyOutput> {
    // 1. Verify company profile exists
    const existingProfile = await this._companyProfileRepository.findById(input.companyId);
    if (!existingProfile) {
      throw new NotFoundError('Company profile not found');
    }

    // 2. Check if profile is already rejected
    if (existingProfile.status === 'rejected') {
      throw new ValidationError('Company profile is already rejected');
    }

    // 3. Create document reupload request
    const documentReuploadRequest: DocumentReuploadRequest = {
      documents: input.documents,
      requestedAt: new Date(),
    };

    // 4. Reject the company profile with reupload requests
    const rejectedProfile = await this._companyProfileRepository.update(
      input.companyId,
      existingProfile.reject(documentReuploadRequest)
    );

    return {
      companyId: rejectedProfile.id,
      userId: rejectedProfile.userId,
      message: 'Company profile rejected successfully',
    };
  }
}

