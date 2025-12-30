import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { IRescheduleInterviewUseCase, RescheduleInterviewInput, RescheduleInterviewOutput } from './interfaces';

@injectable()
export class RescheduleInterviewUseCase implements IRescheduleInterviewUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository
    ) { }

    async execute(input: RescheduleInterviewInput & { companyId: string }): Promise<RescheduleInterviewOutput> {
        // 1. Get application
        const application = await this._applicationRepository.findById(input.applicationId);
        if (!application) {
            throw new NotFoundError('Application not found');
        }

        // 2. Verify application belongs to company
        if (application.companyId !== input.companyId) {
            throw new ForbiddenError('You do not have access to this application');
        }

        // 3. Find the interview round
        const roundIndex = application.interviewRounds.findIndex(r => r.roundName === input.roundName);
        if (roundIndex === -1) {
            throw new NotFoundError(`Interview round "${input.roundName}" not found`);
        }

        const round = application.interviewRounds[roundIndex];

        // 4. Verify round is scheduled (not completed/cancelled)
        if (round.status !== 'scheduled') {
            throw new ValidationError('Can only reschedule scheduled interviews');
        }

        // 5. Validate new scheduled time
        const newScheduledAt = new Date(input.newScheduledAt);
        if (isNaN(newScheduledAt.getTime())) {
            throw new ValidationError('Invalid scheduled date');
        }
        if (newScheduledAt < new Date()) {
            throw new ValidationError('Scheduled date must be in the future');
        }

        // 6. Check for conflicts (exclude current round being rescheduled)
        const interviewerId = input.newInterviewerId || round.interviewerIds[0];
        if (interviewerId) {
            const hasConflict = await this._applicationRepository.hasConflictingInterview(
                interviewerId,
                newScheduledAt,
                input.applicationId,
                input.roundName
            );
            if (hasConflict) {
                throw new ValidationError('This interviewer has a conflicting interview at this time');
            }
        }

        // 7. Store old schedule in history
        const historyEntry = {
            requestedBy: 'company' as const,
            requestedById: input.companyId,
            reason: input.reason,
            status: 'approved' as const,
            requestedAt: new Date(),
            respondedAt: new Date(),
        };

        // 8. Update round
        const updatedRounds = [...application.interviewRounds];
        updatedRounds[roundIndex] = {
            ...round,
            scheduledAt: newScheduledAt,
            interviewerIds: input.newInterviewerId ? [input.newInterviewerId] : round.interviewerIds,
            rescheduleHistory: [...(round.rescheduleHistory || []), historyEntry],
        };

        await this._applicationRepository.update(input.applicationId, {
            interviewRounds: updatedRounds,
        });

        // TODO: Send email to candidate and interviewer (Step 7)

        return { message: 'Interview rescheduled successfully' };
    }
}
