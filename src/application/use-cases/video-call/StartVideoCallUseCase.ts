import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { VideoCallStatus, InterviewRound } from '../../../domain/entities/Application';
import {
  IStartVideoCallUseCase,
  StartVideoCallInput,
  StartVideoCallOutput,
} from './interfaces';

@injectable()
export class StartVideoCallUseCase implements IStartVideoCallUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private readonly applicationRepository: IApplicationRepository,
  ) {}

  async execute(input: StartVideoCallInput): Promise<StartVideoCallOutput> {
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
      throw new ForbiddenError('Only the assigned interviewer can start the video call');
    }

    if (!round.scheduledAt) {
      throw new ValidationError('Interview round is not scheduled');
    }

    const now = new Date();
    if (round.scheduledAt > now) {
      throw new ValidationError('Cannot start video call before the scheduled time');
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


