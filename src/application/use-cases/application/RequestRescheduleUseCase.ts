import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository, IDeveloperProfileRepository, IJobRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { IRequestRescheduleUseCase, RequestRescheduleInput, RequestRescheduleOutput } from './interfaces';
import { ICreateNotificationUseCase } from '../notification/interfaces';

@injectable()
export class RequestRescheduleUseCase implements IRequestRescheduleUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
        @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository,
        @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
        @inject(TYPES.CreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase
    ) { }

    async execute(input: RequestRescheduleInput & { developerId: string }): Promise<RequestRescheduleOutput> {
        // 1. Get developer profile to get the actual developerId (profile id, not user id)
        const developerProfile = await this._developerProfileRepository.findByUserId(input.developerId);
        if (!developerProfile) {
            throw new NotFoundError('Developer profile not found');
        }

        // 2. Get application
        const application = await this._applicationRepository.findById(input.applicationId);
        if (!application) {
            throw new NotFoundError('Application not found');
        }

        // 3. Verify application belongs to this developer
        if (application.developerId !== developerProfile.id) {
            throw new ForbiddenError('You do not have access to this application');
        }

        // 4. Find the interview round
        const roundIndex = application.interviewRounds.findIndex(r => r.roundName === input.roundName);
        if (roundIndex === -1) {
            throw new NotFoundError(`Interview round "${input.roundName}" not found`);
        }

        const round = application.interviewRounds[roundIndex];

        // 5. Verify round is scheduled
        if (round.status !== 'scheduled') {
            throw new ValidationError('Can only request reschedule for scheduled interviews');
        }

        // 6. Verify no pending reschedule request exists
        if (round.rescheduleRequest?.status === 'pending') {
            throw new ValidationError('A reschedule request is already pending for this interview');
        }

        // 7. Create reschedule request
        const updatedRounds = [...application.interviewRounds];
        updatedRounds[roundIndex] = {
            ...round,
            rescheduleRequest: {
                requestedBy: 'candidate',
                requestedById: developerProfile.id,
                reason: input.reason,
                proposedScheduledAt: input.proposedScheduledAt ? new Date(input.proposedScheduledAt) : undefined,
                status: 'pending',
                requestedAt: new Date(),
            },
        };

        // 8. Update application
        await this._applicationRepository.update(input.applicationId, {
            interviewRounds: updatedRounds,
        });

        // 9. Notify company about reschedule request
        try {
            const job = await this._jobRepository.findById(application.jobId);
            if (job) {
                await this._createNotificationUseCase.execute({
                    userId: application.companyId,
                    type: 'reschedule_requested',
                    title: 'Reschedule Requested',
                    message: `A candidate has requested to reschedule their ${input.roundName} interview for ${job.title}`,
                    data: { applicationId: input.applicationId, roundName: input.roundName },
                });
            }
        } catch (error) {
            console.error('Failed to send reschedule request notification:', error);
        }

        return {
            message: 'Reschedule request submitted successfully',
        };
    }
}
