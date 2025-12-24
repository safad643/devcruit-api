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
import { ApplicationStatus, StatusNotes, ApplicationProps } from '../../../domain/entities/Application';
import { DeclineOfferInput, DeclineOfferOutput } from '../../dtos/application.dto';
import { IEmailService } from '../../services';
import { IDeclineOfferUseCase } from './interfaces';

@injectable()
export class DeclineOfferUseCase implements IDeclineOfferUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService,
    @inject(TYPES.OfferLetterRepository) private offerLetterRepository: IOfferLetterRepository
  ) { }

  async execute(input: DeclineOfferInput): Promise<DeclineOfferOutput> {
    // 1. Get developer profile (input.developerId is the userId)
    const developerProfile = await this.developerProfileRepository.findByUserId(input.developerId);
    if (!developerProfile) {
      throw new NotFoundError('Developer profile not found');
    }

    // 2. Get application
    const application = await this.applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // 3. Verify the application belongs to the developer
    // application.developerId is the profile ID, not the user ID
    if (application.developerId !== developerProfile.id) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // 4. Validate that we can only decline offer from 'offer_extended' status
    if (application.status !== 'offer_extended') {
      throw new ValidationError(`Cannot decline offer for application with status ${application.status}. Only applications with status 'offer_extended' can be declined.`);
    }

    // 5. Get the job for email notification
    const job = await this.jobRepository.findById(application.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // 6. Prepare update data
    const updateData: Partial<ApplicationProps> = {
      status: 'offer_declined' as ApplicationStatus,
      lastUpdatedAt: new Date(),
    };

    // 7. Add note to statusNotes if provided
    if (input.note) {
      const trimmedNote = input.note.trim();
      const statusNotes: StatusNotes = {
        ...application.statusNotes,
        offer_declined: trimmedNote,
      };
      updateData.statusNotes = statusNotes;
    }

    // 8. Update application
    const updatedApplication = await this.applicationRepository.update(input.applicationId, updateData);

    // 9. Update offer letter status to 'declined'
    if (application.currentOfferLetterId) {
      await this.offerLetterRepository.update(application.currentOfferLetterId, {
        status: 'declined',
        declinedAt: new Date(),
      });
    }

    // 10. Send email notification to company
    try {
      // Get company profile for company name
      const companyProfile = await this.companyProfileRepository.findByUserId(application.companyId);
      const companyName = companyProfile?.companyName || 'the company';

      // Get developer profile and user for developer name/email
      const developerProfile = await this.developerProfileRepository.findById(application.developerId);
      if (developerProfile) {
        const developerUser = await this.userRepository.findById(developerProfile.userId);
        const developerName = developerProfile.name || developerUser?.email || 'the candidate';

        // Note: Email service method for offer decline can be added later
        console.log(`Offer declined by ${developerName} for ${job.title} at ${companyName}`);
      }
    } catch (error) {
      // Log error but don't fail the status update
      console.error('Failed to send offer decline notification:', error);
    }

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      message: 'Offer declined successfully',
    };
  }
}

