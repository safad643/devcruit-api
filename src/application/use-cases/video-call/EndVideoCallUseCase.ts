import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository } from '../../../domain/repositories';
import { ValidationError } from '../../../domain/errors';
import { VideoCallStatus, InterviewRound } from '../../../domain/entities/Application';
import {
  EndVideoCallInput,
  EndVideoCallOutput,
  IEndVideoCallUseCase,
} from './interfaces';
import { VideoCallHelper } from './VideoCallHelper';

@injectable()
export class EndVideoCallUseCase implements IEndVideoCallUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private readonly _applicationRepository: IApplicationRepository,
    @inject(TYPES.VideoCallHelper) private readonly _videoCallHelper: VideoCallHelper,
  ) { }

  async execute(input: EndVideoCallInput): Promise<EndVideoCallOutput> {
    const { application, round } = await this._videoCallHelper.getApplicationAndRound(
      input.applicationId,
      input.roundName,
    );

    await this._videoCallHelper.validateInterviewerAccess(application, round, input.userId);

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



