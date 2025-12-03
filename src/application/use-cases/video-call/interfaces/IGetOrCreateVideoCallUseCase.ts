export interface GetOrCreateVideoCallInput {
  applicationId: string;
  roundName: string;
  userId: string;
}

export interface GetOrCreateVideoCallOutput {
  applicationId: string;
  roundName: string;
  videoCallId: string;
  videoCallStatus: string;
}

export interface IGetOrCreateVideoCallUseCase {
  execute(input: GetOrCreateVideoCallInput): Promise<GetOrCreateVideoCallOutput>;
}


