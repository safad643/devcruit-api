import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository, IJobRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { IAddInterviewRoundUseCase, AddInterviewRoundInput, AddInterviewRoundOutput } from './interfaces';

@injectable()
export class AddInterviewRoundUseCase implements IAddInterviewRoundUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
        @inject(TYPES.JobRepository) private _jobRepository: IJobRepository
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

        // 4. Get job to get current rounds
        const job = await this._jobRepository.findById(application.jobId);
        if (!job) {
            throw new NotFoundError('Job not found');
        }

        // 5. Validate round name is not empty and doesn't exist
        const roundName = input.roundName.trim();
        if (!roundName) {
            throw new ValidationError('Round name is required');
        }

        if (job.interviewRounds.includes(roundName)) {
            throw new ValidationError(`Interview round "${roundName}" already exists for this job`);
        }

        // 6. If insertAfterRound is provided, validate it exists and find position
        let insertIndex = job.interviewRounds.length; // Default: add at end
        if (input.insertAfterRound) {
            const afterIndex = job.interviewRounds.indexOf(input.insertAfterRound);
            if (afterIndex === -1) {
                throw new ValidationError(`Round "${input.insertAfterRound}" not found`);
            }
            insertIndex = afterIndex + 1;

            // Validate: no rounds after insertAfterRound should be completed in application
            for (let i = insertIndex; i < job.interviewRounds.length; i++) {
                const laterRoundName = job.interviewRounds[i];
                const appRound = application.interviewRounds.find(r => r.roundName === laterRoundName);
                if (appRound?.status === 'completed') {
                    throw new ValidationError(`Cannot insert round before a completed round "${laterRoundName}"`);
                }
            }
        }

        // 7. Insert the new round into Job's interviewRounds array
        const updatedJobRounds = [...job.interviewRounds];
        updatedJobRounds.splice(insertIndex, 0, roundName);

        // 8. Update the job with new interview rounds
        await this._jobRepository.update(job.id, {
            interviewRounds: updatedJobRounds,
        });

        return {
            message: `Interview round "${roundName}" added successfully`,
            interviewRounds: updatedJobRounds,
        };
    }
}
