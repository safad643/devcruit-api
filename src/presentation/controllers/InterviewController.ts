import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import {
    IScheduleInterviewRoundUseCase,
    IUpdateInterviewResultUseCase,
    IGetInterviewsForInterviewerUseCase,
} from '../../application/use-cases/application/interfaces';
import {
    IGetOrCreateVideoCallUseCase,
    IStartVideoCallUseCase,
    IEndVideoCallUseCase
} from '../../application/use-cases/video-call/interfaces';
import {
    ScheduleInterviewRoundInput,
    UpdateInterviewResultInput,
} from '../schemas/application.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';
import { ForbiddenError } from '../../domain/errors';

@injectable()
export class InterviewController {
    constructor(
        @inject(TYPES.ScheduleInterviewRoundUseCase) private _scheduleInterviewRoundUseCase: IScheduleInterviewRoundUseCase,
        @inject(TYPES.UpdateInterviewResultUseCase) private _updateInterviewResultUseCase: IUpdateInterviewResultUseCase,
        @inject(TYPES.GetInterviewsForInterviewerUseCase) private _getInterviewsForInterviewerUseCase: IGetInterviewsForInterviewerUseCase,
        @inject(TYPES.GetOrCreateVideoCallUseCase) private _getOrCreateVideoCallUseCase: IGetOrCreateVideoCallUseCase,
        @inject(TYPES.StartVideoCallUseCase) private _startVideoCallUseCase: IStartVideoCallUseCase,
        @inject(TYPES.EndVideoCallUseCase) private _endVideoCallUseCase: IEndVideoCallUseCase
    ) { }

    // Company/HR endpoint: Schedule interview round
    scheduleInterviewRound = async (
        request: FastifyRequest<{ Params: { id: string }; Body: ScheduleInterviewRoundInput }>,
        reply: FastifyReply
    ): Promise<void> => {
        const companyContext = this._getCompanyContext(request);
        const companyId = companyContext.companyUserId;
        const applicationId = request.params.id;
        const result = await this._scheduleInterviewRoundUseCase.execute({
            applicationId,
            companyId,
            ...request.body,
        });
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    // Interviewer endpoint: Update interview result
    updateInterviewResult = async (
        request: FastifyRequest<{ Params: { id: string }; Body: UpdateInterviewResultInput }>,
        reply: FastifyReply
    ): Promise<void> => {
        const interviewerId = request.user?.id as string;
        const applicationId = request.params.id;
        const result = await this._updateInterviewResultUseCase.execute({
            applicationId,
            interviewerId,
            ...request.body,
        });
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    // Interviewer endpoint: Get interviews for interviewer
    getInterviewsForInterviewer = async (
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> => {
        const interviewerId = request.user?.id as string;
        const result = await this._getInterviewsForInterviewerUseCase.execute(interviewerId);
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    // Developer/Interviewer/HR/Company endpoint: Get or create video call for an interview round
    getOrCreateVideoCall = async (
        request: FastifyRequest<{ Params: { id: string; roundName: string } }>,
        reply: FastifyReply
    ): Promise<void> => {
        const userId = request.user?.id as string;
        const applicationId = request.params.id;
        const { roundName } = request.params;

        const result = await this._getOrCreateVideoCallUseCase.execute({
            applicationId,
            roundName,
            userId,
        });

        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    // Interviewer/HR/Company endpoint: Mark video call as started
    startVideoCall = async (
        request: FastifyRequest<{ Params: { id: string; roundName: string } }>,
        reply: FastifyReply
    ): Promise<void> => {
        const userId = request.user?.id as string;
        const applicationId = request.params.id;
        const { roundName } = request.params;

        const result = await this._startVideoCallUseCase.execute({
            applicationId,
            roundName,
            userId,
        });

        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    // Interviewer/HR/Company endpoint: Mark video call as ended
    endVideoCall = async (
        request: FastifyRequest<{ Params: { id: string; roundName: string } }>,
        reply: FastifyReply
    ): Promise<void> => {
        const userId = request.user?.id as string;
        const applicationId = request.params.id;
        const { roundName } = request.params;

        const result = await this._endVideoCallUseCase.execute({
            applicationId,
            roundName,
            userId,
        });

        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    private _getCompanyContext(request: FastifyRequest) {
        const companyContext = request.companyContext;
        if (!companyContext) {
            throw new ForbiddenError('Company context missing. Ensure checkCompanyPaid middleware is applied.');
        }
        return companyContext;
    }
}
