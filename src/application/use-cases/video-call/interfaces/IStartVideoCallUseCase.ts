export interface StartVideoCallInput {
  applicationId: string;
  roundName: string;
  userId: string;
}

export interface StartVideoCallOutput {
  applicationId: string;
  roundName: string;
  videoCallId: string;
  videoCallStatus: string;
}

export interface IStartVideoCallUseCase {
  execute(input: StartVideoCallInput): Promise<StartVideoCallOutput>;
}


