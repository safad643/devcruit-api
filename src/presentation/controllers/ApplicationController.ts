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
  IRejectApplicationUseCase
} from '../../application/use-cases/application/interfaces';
import { 
  CreateApplicationInput, 
  ListApplicationsForCompanyQueryInput,
  ListApplicationsForDeveloperQueryInput,
  WithdrawApplicationInput,
  RejectApplicationInput
} from '../schemas/application.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

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
    @inject(TYPES.RejectApplicationUseCase) private rejectApplicationUseCase: IRejectApplicationUseCase
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
    const companyId = request.user?.id as string;
    const query = request.query;
    
    // Convert string query parameters to integers
    const page = query.page ? (typeof query.page === 'string' ? parseInt(query.page, 10) : query.page) : 1;
    const limit = query.limit ? (typeof query.limit === 'string' ? parseInt(query.limit, 10) : query.limit) : 25;
    
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

  // Company endpoint: Get application details
  getApplicationDetails = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyId = request.user?.id as string;
    const applicationId = request.params.id;
    const result = await this.getApplicationDetailsUseCase.execute(applicationId, companyId);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Developer endpoint: List their own applications
  listApplicationsForDeveloper = async (
    request: FastifyRequest<{ Querystring: ListApplicationsForDeveloperQueryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const developerId = request.user?.id as string;
    const query = request.query;
    
    // Convert string query parameters to integers
    const page = query.page ? (typeof query.page === 'string' ? parseInt(query.page, 10) : query.page) : 1;
    const limit = query.limit ? (typeof query.limit === 'string' ? parseInt(query.limit, 10) : query.limit) : 25;
    
    const result = await this.listApplicationsForDeveloperUseCase.execute({
      developerId,
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
    const companyId = request.user?.id as string;
    const jobId = request.params.jobId;
    const result = await this.getApplicationMetricsUseCase.execute(jobId, companyId);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Company endpoint: Shortlist application
  shortlistApplication = async (
    request: FastifyRequest<{ Params: { id: string }; Body?: { note?: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyId = request.user?.id as string;
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
    const companyId = request.user?.id as string;
    const applicationId = request.params.id;
    const note = request.body?.note?.trim() || undefined;
    const result = await this.rejectApplicationUseCase.execute({
      applicationId,
      companyId,
      note,
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };
}

