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
import { ICreateNotificationUseCase } from '../notification/interfaces';

@injectable()
export class DeclineOfferUseCase implements IDeclineOfferUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.OfferLetterRepository) private _offerLetterRepository: IOfferLetterRepository,
    @inject(TYPES.CreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase
  ) { }

  async execute(input: DeclineOfferInput): Promise<DeclineOfferOutput> {
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
    if (application.developerId !== developerProfile.id) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // 4. Validate that we can only decline offer from 'offer_extended' status
    if (application.status !== 'offer_extended') {
      throw new ValidationError(`Cannot decline offer for application with status ${application.status}. Only applications with status 'offer_extended' can be declined.`);
    }

    // 5. Get the job
    const job = await this._jobRepository.findById(application.jobId);
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
    const updatedApplication = await this._applicationRepository.update(input.applicationId, updateData);

    // 9. Update offer letter status to 'declined'
    if (application.currentOfferLetterId) {
      await this._offerLetterRepository.update(application.currentOfferLetterId, {
        status: 'declined',
        declinedAt: new Date(),
      });
    }

    // 10. Notify company about offer decline
    try {
      const developerUser = await this._userRepository.findById(developerProfile.userId);
      const developerName = developerUser?.name || 'A candidate';

      await this._createNotificationUseCase.execute({
        userId: application.companyId,
        type: 'offer_declined',
        title: 'Offer Declined',
        message: `${developerName} has declined your offer for ${job.title}`,
        data: { applicationId: input.applicationId, jobId: job.id },
      });
    } catch (error) {
      console.error('Failed to send offer decline notification:', error);
    }

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      message: 'Offer declined successfully',
    };
  }
}
