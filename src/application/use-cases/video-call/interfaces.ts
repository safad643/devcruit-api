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
