import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import {
  ICreateApplicationUseCase,
  IListApplicationsForCompanyUseCase,
  IGetApplicationDetailsUseCase,
  IListApplicationsForDeveloperUseCase,
  IWithdrawApplicationUseCase,
  IGetApplicationMetricsUseCase,
  IShortlistApplicationUseCase,
  IRejectApplicationUseCase,
  IScheduleInterviewRoundUseCase,
  IUpdateInterviewResultUseCase,
  IGetInterviewsForInterviewerUseCase,
} from '../../application/use-cases/application/interfaces';
import {
  IGetOrCreateVideoCallUseCase,
  IStartVideoCallUseCase,
  IEndVideoCallUseCase
} from '../../application/use-cases/video-call/interfaces';
import { 
  CreateApplicationInput, 
  ListApplicationsForCompanyQueryInput,
  ListApplicationsForDeveloperQueryInput,
  WithdrawApplicationInput,
  RejectApplicationInput,
  ScheduleInterviewRoundInput,
  UpdateInterviewResultInput
} from '../schemas/application.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';
import { ForbiddenError } from '../../domain/errors';

@injectable()
export class ApplicationController {
  constructor(
    @inject(TYPES.CreateApplicationUseCase) private createApplicationUseCase: ICreateApplicationUseCase,
    @inject(TYPES.ListApplicationsForCompanyUseCase) private listApplicationsForCompanyUseCase: IListApplicationsForCompanyUseCase,
    @inject(TYPES.GetApplicationDetailsUseCase) private getApplicationDetailsUseCase: IGetApplicationDetailsUseCase,
    @inject(TYPES.ListApplicationsForDeveloperUseCase) private listApplicationsForDeveloperUseCase: IListApplicationsForDeveloperUseCase,
    @inject(TYPES.WithdrawApplicationUseCase) private withdrawApplicationUseCase: IWithdrawApplicationUseCase,
    @inject(TYPES.GetApplicationMetricsUseCase) private getApplicationMetricsUseCase: IGetApplicationMetricsUseCase,
    @inject(TYPES.ShortlistApplicationUseCase) private shortlistApplicationUseCase: IShortlistApplicationUseCase,
    @inject(TYPES.RejectApplicationUseCase) private rejectApplicationUseCase: IRejectApplicationUseCase,
    @inject(TYPES.ScheduleInterviewRoundUseCase) private scheduleInterviewRoundUseCase: IScheduleInterviewRoundUseCase,
    @inject(TYPES.UpdateInterviewResultUseCase) private updateInterviewResultUseCase: IUpdateInterviewResultUseCase,
    @inject(TYPES.GetInterviewsForInterviewerUseCase) private getInterviewsForInterviewerUseCase: IGetInterviewsForInterviewerUseCase,
    @inject(TYPES.GetOrCreateVideoCallUseCase) private getOrCreateVideoCallUseCase: IGetOrCreateVideoCallUseCase,
    @inject(TYPES.StartVideoCallUseCase) private startVideoCallUseCase: IStartVideoCallUseCase,
    @inject(TYPES.EndVideoCallUseCase) private endVideoCallUseCase: IEndVideoCallUseCase
  ) {}

  // Developer endpoint: Apply to a job
  applyToJob = async (
    request: FastifyRequest<{ Body: CreateApplicationInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const developerId = request.user?.id as string;
    const result = await this.createApplicationUseCase.execute({ 
      ...request.body, 
      developerId 
    });
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  // Company endpoint: List applications for their jobs
  listApplicationsForCompany = async (
    request: FastifyRequest<{ Querystring: ListApplicationsForCompanyQueryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const query = request.query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    
    const result = await this.listApplicationsForCompanyUseCase.execute({
      companyId,
      jobId: query.jobId,
      status: query.status,
      page,
      limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Company/HR/Interviewer endpoint: Get application details
  getApplicationDetails = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const applicationId = request.params.id;
    const userRole = request.user?.role;
    
    let companyId: string | undefined;
    let interviewerId: string | undefined;
    
    if (userRole === 'company' || userRole === 'hr') {
      const companyContext = this.getCompanyContext(request);
      companyId = companyContext.companyUserId;
    } else if (userRole === 'interviewer') {
      interviewerId = request.user?.id as string;
    }
    
    const result = await this.getApplicationDetailsUseCase.execute(applicationId, companyId, interviewerId);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Developer endpoint: List their own applications
  listApplicationsForDeveloper = async (
    request: FastifyRequest<{ Querystring: ListApplicationsForDeveloperQueryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const developerId = request.user?.id as string;
    const query = request.query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    
    const result = await this.listApplicationsForDeveloperUseCase.execute({
      developerId,
      jobId: query.jobId,
      status: query.status,
      page,
      limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Developer endpoint: Withdraw application
  withdrawApplication = async (
    request: FastifyRequest<{ Body: WithdrawApplicationInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const developerId = request.user?.id as string;
    const result = await this.withdrawApplicationUseCase.execute({
      applicationId: request.body.applicationId,
      developerId,
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Company endpoint: Get application metrics for a job
  getApplicationMetrics = async (
    request: FastifyRequest<{ Params: { jobId: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const jobId = request.params.jobId;
    const result = await this.getApplicationMetricsUseCase.execute(jobId, companyId);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Company endpoint: Shortlist application
  shortlistApplication = async (
    request: FastifyRequest<{ Params: { id: string }; Body?: { note?: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const applicationId = request.params.id;
    const note = request.body?.note?.trim() || undefined;
    const result = await this.shortlistApplicationUseCase.execute({
      applicationId,
      companyId,
      note,
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Company endpoint: Reject application
  rejectApplication = async (
    request: FastifyRequest<{ Params: { id: string }; Body?: RejectApplicationInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const applicationId = request.params.id;
    const note = request.body?.note?.trim() || undefined;
    const result = await this.rejectApplicationUseCase.execute({
      applicationId,
      companyId,
      note,
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Company/HR endpoint: Schedule interview round
  scheduleInterviewRound = async (
    request: FastifyRequest<{ Params: { id: string }; Body: ScheduleInterviewRoundInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const applicationId = request.params.id;
    const result = await this.scheduleInterviewRoundUseCase.execute({
      applicationId,
      companyId,
      ...request.body,
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Interviewer endpoint: Update interview result
  updateInterviewResult = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateInterviewResultInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const interviewerId = request.user?.id as string;
    const applicationId = request.params.id;
    const result = await this.updateInterviewResultUseCase.execute({
      applicationId,
      interviewerId,
      ...request.body,
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Interviewer endpoint: Get interviews for interviewer
  getInterviewsForInterviewer = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const interviewerId = request.user?.id as string;
    const result = await this.getInterviewsForInterviewerUseCase.execute(interviewerId);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Developer/Interviewer/HR/Company endpoint: Get or create video call for an interview round
  getOrCreateVideoCall = async (
    request: FastifyRequest<{ Params: { id: string; roundName: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id as string;
    const applicationId = request.params.id;
    const { roundName } = request.params;

    const result = await this.getOrCreateVideoCallUseCase.execute({
      applicationId,
      roundName,
      userId,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Interviewer/HR/Company endpoint: Mark video call as started
  startVideoCall = async (
    request: FastifyRequest<{ Params: { id: string; roundName: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id as string;
    const applicationId = request.params.id;
    const { roundName } = request.params;

    const result = await this.startVideoCallUseCase.execute({
      applicationId,
      roundName,
      userId,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Interviewer/HR/Company endpoint: Mark video call as ended
  endVideoCall = async (
    request: FastifyRequest<{ Params: { id: string; roundName: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id as string;
    const applicationId = request.params.id;
    const { roundName } = request.params;

    const result = await this.endVideoCallUseCase.execute({
      applicationId,
      roundName,
      userId,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  private getCompanyContext(request: FastifyRequest) {
    const companyContext = request.companyContext;
    if (!companyContext) {
      throw new ForbiddenError('Company context missing. Ensure checkCompanyPaid middleware is applied.');
    }
    return companyContext;
  }
}

