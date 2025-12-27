import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository, IDeveloperProfileRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';
import { Application, InterviewRound } from '../../../domain/entities/Application';

export interface VideoCallContext {
    application: Application;
    round: InterviewRound;
}

@injectable()
export class VideoCallHelper {
    constructor(
        @inject(TYPES.ApplicationRepository) private readonly _applicationRepository: IApplicationRepository,
        @inject(TYPES.DeveloperProfileRepository) private readonly _developerProfileRepository: IDeveloperProfileRepository,
    ) { }

    async getApplicationAndRound(applicationId: string, roundName: string): Promise<VideoCallContext> {
        const application = await this._applicationRepository.findById(applicationId);
        if (!application) {
            throw new NotFoundError('Application not found');
        }

        const round = application.interviewRounds.find(
            (r: InterviewRound) => r.roundName === roundName,
        );
        if (!round) {
            throw new NotFoundError(`Interview round "${roundName}" not found`);
        }

        return { application, round };
    }

    async validateInterviewerAccess(
        application: Application,
        round: InterviewRound,
        userId: string,
    ): Promise<void> {
        const isInterviewer =
            round.interviewerIds.includes(userId) || application.companyId === userId;

        if (!isInterviewer) {
            throw new ForbiddenError('Only the assigned interviewer can perform this action');
        }
    }

    async validateParticipantAccess(
        application: Application,
        round: InterviewRound,
        userId: string,
    ): Promise<void> {
        const isDeveloper = await this._isDeveloper(application, userId);
        const isInterviewer = round.interviewerIds.includes(userId) || application.companyId === userId;

        if (!isDeveloper && !isInterviewer) {
            throw new ForbiddenError('You are not allowed to access this interview video call');
        }
    }

    private async _isDeveloper(application: Application, userId: string): Promise<boolean> {
        const developerProfile = await this._developerProfileRepository.findByUserId(userId);
        return !!developerProfile && developerProfile.id === application.developerId;
    }
}
