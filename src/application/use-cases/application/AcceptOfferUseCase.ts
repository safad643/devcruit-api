import {
  IApplicationRepository,
  IJobRepository,
  IDeveloperProfileRepository,
  ICompanyProfileRepository,
  IUserRepository,
  IOfferLetterRepository
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { ApplicationStatus, ApplicationProps } from '../../../domain/entities/Application';
import { AcceptOfferInput, AcceptOfferOutput } from '../../dtos/application.dto';
import { IEmailService } from '../../services';
import { IAcceptOfferUseCase } from './interfaces';

@injectable()
export class AcceptOfferUseCase implements IAcceptOfferUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.OfferLetterRepository) private _offerLetterRepository: IOfferLetterRepository
  ) { }

  async execute(input: AcceptOfferInput): Promise<AcceptOfferOutput> {
    // 1. Get developer profile (input.developerId is the userId)
    const developerProfile = await this._developerProfileRepository.findByUserId(input.developerId);
    if (!developerProfile) {
      throw new NotFoundError('Developer profile not found');
    }

    // 2. Get application
    const application = await this._applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // 3. Verify the application belongs to the developer
    // application.developerId is the profile ID, not the user ID
    if (application.developerId !== developerProfile.id) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // 4. Validate that we can only accept offer from 'offer_extended' status
    if (application.status !== 'offer_extended') {
      throw new ValidationError(`Cannot accept offer for application with status ${application.status}. Only applications with status 'offer_extended' can be accepted.`);
    }

    // 5. Get the job for email notification
    const job = await this._jobRepository.findById(application.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // 6. Prepare update data
    const updateData: Partial<ApplicationProps> = {
      status: 'offer_accepted' as ApplicationStatus,
      lastUpdatedAt: new Date(),
    };

    // 7. Update application
    const updatedApplication = await this._applicationRepository.update(input.applicationId, updateData);

    // 8. Update offer letter status to 'accepted'
    if (application.currentOfferLetterId) {
      await this._offerLetterRepository.update(application.currentOfferLetterId, {
        status: 'accepted',
        acceptedAt: new Date(),
      });
    }

    // 9. Send email notification to company
    try {
      // Get company profile for company name
      const companyProfile = await this._companyProfileRepository.findByUserId(application.companyId);
      const companyName = companyProfile?.companyName || 'the company';

      // Get developer profile and user for developer name/email
      const developerProfile = await this._developerProfileRepository.findById(application.developerId);
      if (developerProfile) {
        const developerUser = await this._userRepository.findById(developerProfile.userId);
        const developerName = developerUser?.name || developerUser?.email || 'the candidate';

        // Note: Email service method for offer acceptance can be added later
        console.log(`Offer accepted by ${developerName} for ${job.title} at ${companyName}`);
      }
    } catch (error) {
      // Log error but don't fail the status update
      console.error('Failed to send offer acceptance notification:', error);
    }

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      message: 'Offer accepted successfully',
    };
  }
}

