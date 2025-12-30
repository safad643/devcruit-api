import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { IRespondToRescheduleRequestUseCase, RespondToRescheduleRequestInput, RespondToRescheduleRequestOutput } from './interfaces';

@injectable()
export class RespondToRescheduleRequestUseCase implements IRespondToRescheduleRequestUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository
    ) { }

    async execute(input: RespondToRescheduleRequestInput & { companyId: string }): Promise<RespondToRescheduleRequestOutput> {
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

        // 4. Verify pending reschedule request exists
        if (!round.rescheduleRequest || round.rescheduleRequest.status !== 'pending') {
            throw new ValidationError('No pending reschedule request for this interview');
        }

        const updatedRounds = [...application.interviewRounds];
        const now = new Date();

        if (input.approve) {
            // 5a. Approving - validate new scheduled time
            if (!input.newScheduledAt) {
                throw new ValidationError('New scheduled time is required when approving');
            }

            const newScheduledAt = new Date(input.newScheduledAt);
            if (isNaN(newScheduledAt.getTime())) {
                throw new ValidationError('Invalid scheduled date');
            }
            if (newScheduledAt < now) {
                throw new ValidationError('Scheduled date must be in the future');
            }

            // 6a. Check for conflicts (exclude current round being rescheduled)
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

            // 7a. Move request to history with approved status, update schedule
            const resolvedRequest = {
                ...round.rescheduleRequest,
                status: 'approved' as const,
                respondedAt: now,
                responseNote: input.responseNote,
            };

            updatedRounds[roundIndex] = {
                ...round,
                scheduledAt: newScheduledAt,
                interviewerIds: input.newInterviewerId ? [input.newInterviewerId] : round.interviewerIds,
                rescheduleRequest: undefined,
                rescheduleHistory: [...(round.rescheduleHistory || []), resolvedRequest],
            };

            await this._applicationRepository.update(input.applicationId, {
                interviewRounds: updatedRounds,
            });

            // TODO: Send email to candidate and interviewer (Step 7)

            return { message: 'Reschedule request approved. Interview rescheduled.' };
        } else {
            // 5b. Rejecting - move request to history with rejected status
            const resolvedRequest = {
                ...round.rescheduleRequest,
                status: 'rejected' as const,
                respondedAt: now,
                responseNote: input.responseNote,
            };

            updatedRounds[roundIndex] = {
                ...round,
                rescheduleRequest: undefined,
                rescheduleHistory: [...(round.rescheduleHistory || []), resolvedRequest],
            };

            await this._applicationRepository.update(input.applicationId, {
                interviewRounds: updatedRounds,
            });

            // TODO: Send rejection email to candidate (Step 7)

            return { message: 'Reschedule request rejected.' };
        }
    }
}
