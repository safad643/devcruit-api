import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository, IDeveloperProfileRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { IRequestRescheduleUseCase, RequestRescheduleInput, RequestRescheduleOutput } from './interfaces';

@injectable()
export class RequestRescheduleUseCase implements IRequestRescheduleUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
        @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository
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

        // TODO: Send email notification to company (will be added in Step 7)

        return {
            message: 'Reschedule request submitted successfully',
        };
    }
}
