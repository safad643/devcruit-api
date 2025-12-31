import {
    AcceptOfferInput,
    AcceptOfferOutput,
    ApplicationMetricsOutput,
    CreateApplicationInput,
    CreateApplicationOutput,
    DeclineOfferInput,
    DeclineOfferOutput,
    DeveloperApplicationDetailsOutput,
    ExtendOfferInput,
    ExtendOfferOutput,
    GetApplicationDetailsOutput,
    ListApplicationsForCompanyInput,
    ListApplicationsForCompanyOutput,
    ListApplicationsForDeveloperInput,
    ListApplicationsForDeveloperOutput,
    RejectApplicationInput,
    RejectApplicationOutput,
    UpdateApplicationStatusInput,
    UpdateApplicationStatusOutput,
    WithdrawApplicationInput,
    WithdrawApplicationOutput,
} from '../../dtos/application.dto';
import { InterviewRoundResult } from '../../../domain/entities/Application';

export interface ICreateApplicationUseCase {
    execute(input: CreateApplicationInput & { developerId: string }): Promise<CreateApplicationOutput>;
}

export interface IListApplicationsForCompanyUseCase {
    execute(input: ListApplicationsForCompanyInput & { companyId: string }): Promise<ListApplicationsForCompanyOutput>;
}

export interface IGetApplicationDetailsUseCase {
    execute(applicationId: string, companyId?: string, interviewerId?: string): Promise<GetApplicationDetailsOutput>;
}

export interface IListApplicationsForDeveloperUseCase {
    execute(input: ListApplicationsForDeveloperInput & { developerId: string }): Promise<ListApplicationsForDeveloperOutput>;
}

export interface IGetDeveloperApplicationDetailsUseCase {
    execute(applicationId: string, developerId: string): Promise<DeveloperApplicationDetailsOutput>;
}

export interface IWithdrawApplicationUseCase {
    execute(input: WithdrawApplicationInput & { developerId: string }): Promise<WithdrawApplicationOutput>;
}

export interface IGetApplicationMetricsUseCase {
    execute(jobId: string, companyId: string): Promise<ApplicationMetricsOutput>;
}

export interface IShortlistApplicationUseCase {
    execute(input: UpdateApplicationStatusInput): Promise<UpdateApplicationStatusOutput>;
}

export interface IRejectApplicationUseCase {
    execute(input: RejectApplicationInput): Promise<RejectApplicationOutput>;
}

export interface ScheduleInterviewRoundInput {
    applicationId: string;
    roundName: string;
    interviewerId: string;
    scheduledAt: string;
}

export interface ScheduleInterviewRoundOutput {
    id: string;
    status: string;
    interviewRounds: Array<{
        roundName: string;
        status: string;
        scheduledAt?: Date;
        interviewerIds: string[];
    }>;
    message: string;
}

export interface IScheduleInterviewRoundUseCase {
    execute(input: ScheduleInterviewRoundInput & { companyId: string }): Promise<ScheduleInterviewRoundOutput>;
}

export interface UpdateInterviewResultInput {
    applicationId: string;
    roundName: string;
    result: InterviewRoundResult;
    feedback?: string;
}

export interface UpdateInterviewResultOutput {
    id: string;
    status: string;
    interviewRounds: Array<{
        roundName: string;
        status: string;
        result?: string;
        feedback?: string;
        completedAt?: Date;
    }>;
    message: string;
}

export interface IUpdateInterviewResultUseCase {
    execute(input: UpdateInterviewResultInput & { interviewerId: string }): Promise<UpdateInterviewResultOutput>;
}

export interface InterviewForInterviewer {
    applicationId: string;
    jobId: string;
    jobTitle: string;
    developerId: string;
    developerName?: string;
    developerEmail?: string;
    companyId: string;
    companyName?: string;
    roundName: string;
    scheduledAt?: Date;
    status: string;
    result?: string;
    feedback?: string;
    videoCallId?: string;
    videoCallStatus?: string;
}

export interface GetInterviewsForInterviewerOutput {
    interviews: InterviewForInterviewer[];
    total: number;
}

export interface IGetInterviewsForInterviewerUseCase {
    execute(interviewerId: string): Promise<GetInterviewsForInterviewerOutput>;
}

export interface IExtendOfferUseCase {
    execute(input: ExtendOfferInput): Promise<ExtendOfferOutput>;
}

export interface IAcceptOfferUseCase {
    execute(input: AcceptOfferInput): Promise<AcceptOfferOutput>;
}

export interface IDeclineOfferUseCase {
    execute(input: DeclineOfferInput): Promise<DeclineOfferOutput>;
}

// Reschedule Use Cases

export interface RequestRescheduleInput {
    applicationId: string;
    roundName: string;
    reason?: string;
    proposedScheduledAt?: string;
}

export interface RequestRescheduleOutput {
    message: string;
}

export interface IRequestRescheduleUseCase {
    execute(input: RequestRescheduleInput & { developerId: string }): Promise<RequestRescheduleOutput>;
}

export interface RespondToRescheduleRequestInput {
    applicationId: string;
    roundName: string;
    approve: boolean;
    responseNote?: string;
    newScheduledAt?: string;
    newInterviewerId?: string;
}

export interface RespondToRescheduleRequestOutput {
    message: string;
}

export interface IRespondToRescheduleRequestUseCase {
    execute(input: RespondToRescheduleRequestInput & { companyId: string }): Promise<RespondToRescheduleRequestOutput>;
}

export interface RescheduleInterviewInput {
    applicationId: string;
    roundName: string;
    newScheduledAt: string;
    newInterviewerId?: string;
    reason?: string;
}

export interface RescheduleInterviewOutput {
    message: string;
}

export interface IRescheduleInterviewUseCase {
    execute(input: RescheduleInterviewInput & { companyId: string }): Promise<RescheduleInterviewOutput>;
}

// Add Interview Round Use Case
export interface AddInterviewRoundInput {
    applicationId: string;
    roundName: string;
    insertAfterRound?: string;
}

export interface AddInterviewRoundOutput {
    message: string;
    interviewRounds: string[];
}

export interface IAddInterviewRoundUseCase {
    execute(input: AddInterviewRoundInput & { companyId: string }): Promise<AddInterviewRoundOutput>;
}

