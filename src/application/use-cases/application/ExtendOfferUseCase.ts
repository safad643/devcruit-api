import { 
  IApplicationRepository, 
  IJobRepository,
  IDeveloperProfileRepository,
  ICompanyProfileRepository,
  IUserRepository
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { ApplicationStatus, StatusNotes, ApplicationProps } from '../../../domain/entities/Application';
import { ExtendOfferInput, ExtendOfferOutput } from '../../dtos/application.dto';
import { IEmailService } from '../../services';
import { IExtendOfferUseCase } from './interfaces';

@injectable()
export class ExtendOfferUseCase implements IExtendOfferUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService
  ) {}

  async execute(input: ExtendOfferInput): Promise<ExtendOfferOutput> {
    // 1. Get application
    const application = await this.applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // 2. Verify the application belongs to the company
    if (application.companyId !== input.companyId) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // 3. Validate that we can only extend offer from 'interview_completed' status
    if (application.status !== 'interview_completed') {
      throw new ValidationError(`Cannot extend offer for application with status ${application.status}. Only applications with status 'interview_completed' can receive an offer.`);
    }

    // 4. Get the job for email notification
    const job = await this.jobRepository.findById(application.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // 5. Prepare update data
    const updateData: Partial<ApplicationProps> = {
      status: 'offer_extended' as ApplicationStatus,
      lastUpdatedAt: new Date(),
    };

    // 6. Add note to statusNotes if provided
    if (input.note) {
      const trimmedNote = input.note.trim();
      const statusNotes: StatusNotes = {
        ...application.statusNotes,
        offer_extended: trimmedNote,
      };
      updateData.statusNotes = statusNotes;
    }

    // 7. Update application
    const updatedApplication = await this.applicationRepository.update(input.applicationId, updateData);

    // 8. Send email notification
    try {
      // Get developer profile to get userId
      const developerProfile = await this.developerProfileRepository.findById(application.developerId);
      if (developerProfile) {
        // Get company profile for company name
        const companyProfile = await this.companyProfileRepository.findByUserId(input.companyId);
        const companyName = companyProfile?.companyName || 'the company';
        
        // Get developer user email
        const developerUser = await this.userRepository.findById(developerProfile.userId);
        if (developerUser?.email) {
          // Note: Email service method for offer extension can be added later
          // For now, we'll just log it
          console.log(`Offer extended to ${developerUser.email} for ${job.title} at ${companyName}`);
        }
      }
    } catch (error) {
      // Log error but don't fail the status update
      console.error('Failed to send offer extension notification:', error);
    }

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      message: 'Offer extended successfully',
    };
  }
}

