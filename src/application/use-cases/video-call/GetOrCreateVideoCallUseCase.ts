import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository } from '../../../domain/repositories';
import { VideoCallStatus, InterviewRound } from '../../../domain/entities/Application';
import {
  GetOrCreateVideoCallInput,
  GetOrCreateVideoCallOutput,
  IGetOrCreateVideoCallUseCase,
} from './interfaces';
import { VideoCallHelper } from './VideoCallHelper';

@injectable()
export class GetOrCreateVideoCallUseCase implements IGetOrCreateVideoCallUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private readonly applicationRepository: IApplicationRepository,
    @inject(TYPES.VideoCallHelper) private readonly videoCallHelper: VideoCallHelper,
  ) { }

  async execute(input: GetOrCreateVideoCallInput): Promise<GetOrCreateVideoCallOutput> {
    const { application, round } = await this.videoCallHelper.getApplicationAndRound(
      input.applicationId,
      input.roundName,
    );

    await this.videoCallHelper.validateParticipantAccess(application, round, input.userId);

    const currentStatus: VideoCallStatus = round.videoCallStatus ?? 'not-started';

    if (round.videoCallId) {
      return {
        applicationId: application.id,
        roundName: round.roundName,
        videoCallId: round.videoCallId,
        videoCallStatus: currentStatus,
      };
    }

    // Deterministic, simple identifier: stable per (applicationId, roundName)
    const videoCallId = `${application.id}:${round.roundName}`;

    const updatedRounds = application.interviewRounds.map((r: InterviewRound) =>
      r.roundName === round.roundName
        ? {
          ...r,
          videoCallId,
          videoCallStatus: currentStatus,
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



