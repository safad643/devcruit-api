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
import { RejectApplicationInput, RejectApplicationOutput } from '../../dtos/application.dto';
import { IEmailService } from '../../services';
import { IRejectApplicationUseCase } from './interfaces';
import { INotificationService } from '../../services/INotificationService';

@injectable()
export class RejectApplicationUseCase implements IRejectApplicationUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService
  ) { }

  async execute(input: RejectApplicationInput): Promise<RejectApplicationOutput> {
    // 1. Get application
    const application = await this._applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // 2. Verify the application belongs to the company
    if (application.companyId !== input.companyId) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // 3. Validate that we can only reject from certain statuses
    const rejectableStatuses: ApplicationStatus[] = ['applied', 'shortlisted', 'interviewing'];
    if (!rejectableStatuses.includes(application.status)) {
      throw new ValidationError(`Cannot reject application with status ${application.status}. Only applications with status 'applied', 'shortlisted', or 'interviewing' can be rejected.`);
    }

    // 4. Get the job (for validation)
    const job = await this._jobRepository.findById(application.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // 5. Prepare update data
    const now = new Date();
    const updateData: Partial<ApplicationProps> = {
      status: 'rejected' as ApplicationStatus,
      rejectedAt: now,
      lastUpdatedAt: now,
    };

    // 6. Set rejectedAtStage from current application status
    updateData.rejectedAtStage = application.status;

    // 7. Add note to statusNotes if provided
    if (input.note) {
      const trimmedNote = input.note.trim();
      const statusNotes: StatusNotes = {
        ...application.statusNotes,
        rejected: trimmedNote,
      };
      updateData.statusNotes = statusNotes;
    }

    // 8. Update application
    const updatedApplication = await this._applicationRepository.update(input.applicationId, updateData);

    // 9. Send email and in-app notification
    try {
      const developerProfile = await this._developerProfileRepository.findById(application.developerId);
      if (developerProfile) {
        const companyProfile = await this._companyProfileRepository.findByUserId(input.companyId);
        const companyName = companyProfile?.companyName || 'the company';

        const developerUser = await this._userRepository.findById(developerProfile.userId);
        if (developerUser?.email) {
          await this._emailService.sendRejectionNotification(
            developerUser.email,
            companyName,
            job.title,
            input.note
          );
        }

        // Send in-app notification
        await this._notificationService.create({
          userId: developerProfile.userId,
          type: 'application_rejected',
          title: 'Application Update',
          message: `Your application for ${job.title} at ${companyName} was not selected to proceed`,
          data: { applicationId: input.applicationId, jobId: job.id },
        });
      }
    } catch (error) {
      console.error('Failed to send rejection notification:', error);
    }

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      message: 'Application rejected successfully',
    };
  }
}
