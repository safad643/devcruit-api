import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository, IDeveloperProfileRepository } from '../../../domain/repositories';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';
import { VideoCallStatus, InterviewRound } from '../../../domain/entities/Application';
import {
  GetOrCreateVideoCallInput,
  GetOrCreateVideoCallOutput,
  IGetOrCreateVideoCallUseCase,
} from './interfaces';

@injectable()
export class GetOrCreateVideoCallUseCase implements IGetOrCreateVideoCallUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private readonly applicationRepository: IApplicationRepository,
    @inject(TYPES.DeveloperProfileRepository) private readonly developerProfileRepository: IDeveloperProfileRepository,
  ) {}

  async execute(input: GetOrCreateVideoCallInput): Promise<GetOrCreateVideoCallOutput> {
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

    // For developers, the JWT contains the User.id, while Application stores DeveloperProfile.id.
    // Resolve the developer profile by userId and compare its id to application.developerId.
    const developerProfile = await this.developerProfileRepository.findByUserId(input.userId);
    const isDeveloper =
      !!developerProfile && developerProfile.id === application.developerId;
    const isInterviewer = round.interviewerIds.includes(input.userId) || application.companyId === input.userId;

    if (!isDeveloper && !isInterviewer) {
      throw new ForbiddenError('You are not allowed to access this interview video call');
    }

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


