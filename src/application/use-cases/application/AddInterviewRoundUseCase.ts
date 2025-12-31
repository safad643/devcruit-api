import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { IAddInterviewRoundUseCase, AddInterviewRoundInput, AddInterviewRoundOutput } from './interfaces';

@injectable()
export class AddInterviewRoundUseCase implements IAddInterviewRoundUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository
    ) { }

    async execute(input: AddInterviewRoundInput & { companyId: string }): Promise<AddInterviewRoundOutput> {
        // 1. Get application
        const application = await this._applicationRepository.findById(input.applicationId);
        if (!application) {
            throw new NotFoundError('Application not found');
        }

        // 2. Verify application belongs to company
        if (application.companyId !== input.companyId) {
            throw new ForbiddenError('You do not have access to this application');
        }

        // 3. Verify application is in valid state
        if (application.status !== 'shortlisted' && application.status !== 'interviewing') {
            throw new ValidationError('Can only add interview rounds for shortlisted or interviewing applications');
        }

        // 4. Validate round name is not empty and doesn't already exist in this application
        const roundName = input.roundName.trim();
        if (!roundName) {
            throw new ValidationError('Round name is required');
        }

        const existingRound = application.interviewRounds.find(r => r.roundName === roundName);
        if (existingRound) {
            throw new ValidationError(`Interview round "${roundName}" already exists for this application`);
        }

        // 5. Find insert position (after the specified round, or at end)
        let insertIndex = application.interviewRounds.length;
        if (input.insertAfterRound) {
            const afterIndex = application.interviewRounds.findIndex(r => r.roundName === input.insertAfterRound);
            if (afterIndex === -1) {
                throw new ValidationError(`Round "${input.insertAfterRound}" not found in this application`);
            }
            insertIndex = afterIndex + 1;

            // Validate: no rounds after insertAfterRound should be completed
            for (let i = insertIndex; i < application.interviewRounds.length; i++) {
                if (application.interviewRounds[i].status === 'completed') {
                    throw new ValidationError(`Cannot insert round before a completed round "${application.interviewRounds[i].roundName}"`);
                }
            }
        }

        // 6. Insert the new round into application's interviewRounds array
        const updatedRounds = [...application.interviewRounds];
        updatedRounds.splice(insertIndex, 0, {
            roundName,
            status: 'pending',
            interviewerIds: [],
        });

        // 7. Update the application
        await this._applicationRepository.update(input.applicationId, {
            interviewRounds: updatedRounds,
        });

        return {
            message: `Interview round "${roundName}" added successfully`,
            interviewRounds: updatedRounds.map(r => r.roundName),
        };
    }
}
