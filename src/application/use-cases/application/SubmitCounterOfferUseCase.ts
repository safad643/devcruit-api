import {
    IApplicationRepository,
    IJobRepository,
    IDeveloperProfileRepository,
    ICompanyProfileRepository,
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { ApplicationStatus, ApplicationProps } from '../../../domain/entities/Application';
import { SubmitCounterOfferInput, SubmitCounterOfferOutput } from '../../dtos/application.dto';
import { ISubmitCounterOfferUseCase } from './interfaces';
import { INotificationService } from '../../services/INotificationService';

@injectable()
export class SubmitCounterOfferUseCase implements ISubmitCounterOfferUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
        @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
        @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository,
        @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
        @inject(TYPES.NotificationService) private _notificationService: INotificationService
    ) { }

    async execute(input: SubmitCounterOfferInput): Promise<SubmitCounterOfferOutput> {
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

        // 4. Validate that we can only submit counter offer from 'offer_extended' status
        if (application.status !== 'offer_extended') {
            throw new ValidationError(`Cannot submit counter offer for application with status ${application.status}. Only applications with status 'offer_extended' can submit a counter offer.`);
        }

        // 5. Get the job for notification
        const job = await this._jobRepository.findById(application.jobId);
        if (!job) {
            throw new NotFoundError('Job not found');
        }

        // 6. Prepare update data
        const updateData: Partial<ApplicationProps> = {
            status: 'counter_offered' as ApplicationStatus,
            lastUpdatedAt: new Date(),
            counterOffer: {
                proposedSalary: input.proposedSalary,
                reason: input.reason,
                submittedAt: new Date(),
            },
            statusNotes: {
                ...application.statusNotes,
                counter_offered: input.reason,
            },
        };

        // 7. Update application
        const updatedApplication = await this._applicationRepository.update(input.applicationId, updateData);

        // 8. Notify company about counter offer
        try {
            const developerUser = await this._developerProfileRepository.findById(application.developerId);
            const companyProfile = await this._companyProfileRepository.findByUserId(application.companyId);

            await this._notificationService.create({
                userId: application.companyId,
                type: 'counter_offer_submitted',
                title: 'Counter Offer Received',
                message: `A candidate has submitted a counter offer for ${job.title}`,
                data: { applicationId: input.applicationId, jobId: job.id },
            });
        } catch (error) {
            console.error('Failed to send counter offer notification:', error);
        }

        return {
            id: updatedApplication.id,
            status: updatedApplication.status,
            message: 'Counter offer submitted successfully',
        };
    }
}
