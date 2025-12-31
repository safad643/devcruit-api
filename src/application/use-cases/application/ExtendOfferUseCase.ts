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
import { ICreateNotificationUseCase } from '../notification/interfaces';

@injectable()
export class ExtendOfferUseCase implements IExtendOfferUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.CreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase
  ) { }

  async execute(input: ExtendOfferInput): Promise<ExtendOfferOutput> {
    // 1. Get application
    const application = await this._applicationRepository.findById(input.applicationId);
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
    const job = await this._jobRepository.findById(application.jobId);
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
    const updatedApplication = await this._applicationRepository.update(input.applicationId, updateData);

    // 8. Send notifications
    try {
      const developerProfile = await this._developerProfileRepository.findById(application.developerId);
      if (developerProfile) {
        const companyProfile = await this._companyProfileRepository.findByUserId(input.companyId);
        const companyName = companyProfile?.companyName || 'the company';

        // Send in-app notification
        await this._createNotificationUseCase.execute({
          userId: developerProfile.userId,
          type: 'offer_extended',
          title: 'Job Offer Received',
          message: `Congratulations! ${companyName} has extended you an offer for ${job.title}`,
          data: { applicationId: input.applicationId, jobId: job.id },
        });
      }
    } catch (error) {
      console.error('Failed to send offer extension notification:', error);
    }

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      message: 'Offer extended successfully',
    };
  }
}
