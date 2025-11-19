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
import { UpdateApplicationStatusInput, UpdateApplicationStatusOutput } from '../../dtos/application.dto';
import { IEmailService } from '../../services';
import { IShortlistApplicationUseCase } from './interfaces';

@injectable()
export class ShortlistApplicationUseCase implements IShortlistApplicationUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService
  ) {}

  async execute(input: UpdateApplicationStatusInput): Promise<UpdateApplicationStatusOutput> {
    // 1. Get application
    const application = await this.applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // 2. Verify the application belongs to the company
    if (application.companyId !== input.companyId) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // 3. Validate that we can only shortlist from 'applied' status
    if (application.status !== 'applied') {
      throw new ValidationError(`Cannot shortlist application with status ${application.status}. Only applications with status 'applied' can be shortlisted.`);
    }

    // 4. Get the job for email notification
    const job = await this.jobRepository.findById(application.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // 5. Prepare update data - only shortlisting logic
    const updateData: Partial<ApplicationProps> = {
      status: 'shortlisted' as ApplicationStatus,
      lastUpdatedAt: new Date(),
    };

    // 6. Set shortlistMethod to manual if not already set
    if (!application.shortlistMethod) {
      updateData.shortlistMethod = 'manual';
    }

    // 7. Add note to statusNotes if provided
    if (input.note) {
      const trimmedNote = input.note.trim();
      const statusNotes: StatusNotes = {
        ...application.statusNotes,
        shortlisted: trimmedNote,
      };
      updateData.statusNotes = statusNotes;
    }

    // 8. Update application
    const updatedApplication = await this.applicationRepository.update(input.applicationId, updateData);

    // 9. Send email notification
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
          await this.emailService.sendShortlistNotification(
            developerUser.email,
            companyName,
            job.title
          );
        }
      }
    } catch (error) {
      // Log error but don't fail the status update
      console.error('Failed to send shortlist notification email:', error);
    }

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      message: 'Application shortlisted successfully',
    };
  }
}

