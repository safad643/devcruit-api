import {
    AcceptOfferInput,
    AcceptOfferOutput,
    ApplicationMetricsOutput,
    CreateApplicationInput,
    CreateApplicationOutput,
    DeclineOfferInput,
    DeclineOfferOutput,
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
