import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { VideoCallStatus, InterviewRound } from '../../../domain/entities/Application';
import {
  EndVideoCallInput,
  EndVideoCallOutput,
  IEndVideoCallUseCase,
} from './interfaces';

@injectable()
export class EndVideoCallUseCase implements IEndVideoCallUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private readonly applicationRepository: IApplicationRepository,
  ) {}

  async execute(input: EndVideoCallInput): Promise<EndVideoCallOutput> {
    const application = await this.applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const round = application.interviewRounds.find(
      (r: InterviewRound) => r.roundName === input.roundName,
    );
    if (!round) {
      throw new NotFoundError(`Interview round "${input.roundName}" not found`);
    }

    const isInterviewer =
      round.interviewerIds.includes(input.userId) || application.companyId === input.userId;

    if (!isInterviewer) {
      throw new ForbiddenError('Only the assigned interviewer can end the video call');
    }
    if (round.videoCallStatus !== 'in-progress') {
      throw new ValidationError('Video call is not in progress');
    }

    const updatedRounds = application.interviewRounds.map((r: InterviewRound) =>
      r.roundName === round.roundName
        ? {
            ...r,
            videoCallStatus: 'ended' as VideoCallStatus,
          }
        : r,
    );

    const updatedApplication = await this.applicationRepository.update(application.id, {
      interviewRounds: updatedRounds,
    });

    const updatedRound = updatedApplication.interviewRounds.find(
      (r: InterviewRound) => r.roundName === input.roundName,
    )!;

    return {
      applicationId: updatedApplication.id,
      roundName: updatedRound.roundName,
      videoCallId: updatedRound.videoCallId as string,
      videoCallStatus: updatedRound.videoCallStatus as VideoCallStatus,
    };
  }
}


