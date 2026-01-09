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
import { RejectCounterOfferInput, RejectCounterOfferOutput } from '../../dtos/application.dto';
import { IRejectCounterOfferUseCase } from './interfaces';
import { INotificationService } from '../../services/INotificationService';

@injectable()
export class RejectCounterOfferUseCase implements IRejectCounterOfferUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
        @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
        @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository,
        @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
        @inject(TYPES.NotificationService) private _notificationService: INotificationService
    ) { }

    async execute(input: RejectCounterOfferInput): Promise<RejectCounterOfferOutput> {
        // 1. Get application
        const application = await this._applicationRepository.findById(input.applicationId);
        if (!application) {
            throw new NotFoundError('Application not found');
        }

        // 2. Verify the application belongs to the company
        if (application.companyId !== input.companyId) {
            throw new ForbiddenError('You do not have access to this application');
        }

        // 3. Validate that we can only reject counter offer from 'counter_offered' status
        if (application.status !== 'counter_offered') {
            throw new ValidationError(`Cannot reject counter offer for application with status ${application.status}. Only applications with status 'counter_offered' can have their counter offer rejected.`);
        }

        // 4. Get the job for notification
        const job = await this._jobRepository.findById(application.jobId);
        if (!job) {
            throw new NotFoundError('Job not found');
        }

        // 5. Prepare update data - revert to offer_extended, clear counter offer
        const updateData: Partial<ApplicationProps> = {
            status: 'offer_extended' as ApplicationStatus,
            lastUpdatedAt: new Date(),
            counterOffer: undefined, // Clear the counter offer
        };

        // 6. Update application
        const updatedApplication = await this._applicationRepository.update(input.applicationId, updateData);

        // 7. Notify developer about counter offer rejection
        try {
            const developerProfile = await this._developerProfileRepository.findById(application.developerId);
            if (developerProfile) {
                const companyProfile = await this._companyProfileRepository.findByUserId(input.companyId);
                const companyName = companyProfile?.companyName || 'The company';

                await this._notificationService.create({
                    userId: developerProfile.userId,
                    type: 'counter_offer_rejected',
                    title: 'Counter Offer Response',
                    message: `${companyName} has responded to your counter offer for ${job.title}. The original offer is still available.`,
                    data: { applicationId: input.applicationId, jobId: job.id },
                });
            }
        } catch (error) {
            console.error('Failed to send counter offer rejection notification:', error);
        }

        return {
            id: updatedApplication.id,
            status: updatedApplication.status,
            message: 'Counter offer rejected. Original offer is still available for the candidate.',
        };
    }
}
