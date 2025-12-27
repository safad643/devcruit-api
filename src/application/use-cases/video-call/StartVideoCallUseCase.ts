import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository } from '../../../domain/repositories';
import { ValidationError } from '../../../domain/errors';
import { VideoCallStatus, InterviewRound } from '../../../domain/entities/Application';
import {
  IStartVideoCallUseCase,
  StartVideoCallInput,
  StartVideoCallOutput,
} from './interfaces';
import { VideoCallHelper } from './VideoCallHelper';

@injectable()
export class StartVideoCallUseCase implements IStartVideoCallUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private readonly _applicationRepository: IApplicationRepository,
    @inject(TYPES.VideoCallHelper) private readonly _videoCallHelper: VideoCallHelper,
  ) { }

  async execute(input: StartVideoCallInput): Promise<StartVideoCallOutput> {
    const { application, round } = await this._videoCallHelper.getApplicationAndRound(
      input.applicationId,
      input.roundName,
    );

    await this._videoCallHelper.validateInterviewerAccess(application, round, input.userId);

    if (!round.scheduledAt) {
      throw new ValidationError('Interview round is not scheduled');
    }

    if (round.videoCallStatus === 'ended') {
      throw new ValidationError('Video call has already ended');
    }

    const videoCallId = round.videoCallId ?? `${application.id}:${round.roundName}`;

    const updatedRounds = application.interviewRounds.map((r: InterviewRound) =>
      r.roundName === round.roundName
        ? {
          ...r,
          videoCallId,
          videoCallStatus: 'in-progress' as VideoCallStatus,
        }
        : r,
    );

    const updatedApplication = await this._applicationRepository.update(application.id, {
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



