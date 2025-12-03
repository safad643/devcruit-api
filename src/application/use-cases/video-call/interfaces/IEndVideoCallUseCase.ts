export interface EndVideoCallInput {
  applicationId: string;
  roundName: string;
  userId: string;
}

export interface EndVideoCallOutput {
  applicationId: string;
  roundName: string;
  videoCallId: string;
  videoCallStatus: string;
}

export interface IEndVideoCallUseCase {
  execute(input: EndVideoCallInput): Promise<EndVideoCallOutput>;
}


