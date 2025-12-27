import { ICompanyProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ResubmitDocumentsInput, ResubmitDocumentsOutput } from '../../dtos/profile.dto';
import { NotFoundError, ValidationError } from '../../../domain/errors';
import { CompanyDocumentKey } from '../../../domain/types';

@injectable()
export class ResubmitDocumentsUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository
  ) { }

  private _isCompanyDocumentKey(key: string): key is CompanyDocumentKey {
    return key === 'COMPANY_REGISTRATION_DOCUMENT' || key === 'COMPANY_VERIFICATION_DOCUMENT';
  }

  async execute(input: ResubmitDocumentsInput): Promise<ResubmitDocumentsOutput> {
    // 1. Verify company profile exists
    const existingProfile = await this._companyProfileRepository.findByUserId(input.userId);
    if (!existingProfile) {
      throw new NotFoundError('Company profile not found');
    }

    // 2. Check if company is in rejected status
    if (existingProfile.status !== 'rejected') {
      throw new ValidationError('Company profile must be in rejected status to resubmit documents');
    }

    // 3. Validate that documents match reupload requests
    // Get the most recent document reupload request
    const documentReuploadRequests = existingProfile.documentReuploadRequests;
    if (documentReuploadRequests.length === 0) {
      throw new ValidationError('No document reupload requests found');
    }

    // Get the most recent request (last in array)
    const mostRecentRequest = documentReuploadRequests[documentReuploadRequests.length - 1];
    const requestedDocumentKeys = mostRecentRequest.documents.map(doc => doc.documentKey);

    // Validate that documents are provided
    if (!input.documents || Object.keys(input.documents).length === 0) {
      throw new ValidationError('At least one document must be provided');
    }

    // Check that all submitted document keys are in the reupload request
    const submittedKeys = Object.keys(input.documents);
    const invalidKeys = submittedKeys.filter(key => {
      if (!this._isCompanyDocumentKey(key)) {
        return true; // Invalid key type
      }
      return !requestedDocumentKeys.includes(key);
    });

    if (invalidKeys.length > 0) {
      throw new ValidationError(`Documents being resubmitted (${invalidKeys.join(', ')}) do not match the requested documents`);
    }

    // 4. Update documents
    const updatedProfile = await this._companyProfileRepository.update(existingProfile.id, existingProfile.resubmitDocuments(input.documents));

    return {
      id: updatedProfile.id,
      userId: updatedProfile.userId,
      message: 'Documents resubmitted successfully',
    };
  }
}


