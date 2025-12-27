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
} from '../../application/use-cases/application/interfaces';
import {
  CreateApplicationInput,
  ListApplicationsForCompanyQueryInput,
  ListApplicationsForDeveloperQueryInput,
  WithdrawApplicationInput,
  RejectApplicationInput,
} from '../schemas/application.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';
import { ForbiddenError } from '../../domain/errors';

@injectable()
export class ApplicationController {
  constructor(
    @inject(TYPES.CreateApplicationUseCase) private _createApplicationUseCase: ICreateApplicationUseCase,
    @inject(TYPES.ListApplicationsForCompanyUseCase) private _listApplicationsForCompanyUseCase: IListApplicationsForCompanyUseCase,
    @inject(TYPES.GetApplicationDetailsUseCase) private _getApplicationDetailsUseCase: IGetApplicationDetailsUseCase,
    @inject(TYPES.ListApplicationsForDeveloperUseCase) private _listApplicationsForDeveloperUseCase: IListApplicationsForDeveloperUseCase,
    @inject(TYPES.WithdrawApplicationUseCase) private _withdrawApplicationUseCase: IWithdrawApplicationUseCase,
    @inject(TYPES.GetApplicationMetricsUseCase) private _getApplicationMetricsUseCase: IGetApplicationMetricsUseCase,
    @inject(TYPES.ShortlistApplicationUseCase) private _shortlistApplicationUseCase: IShortlistApplicationUseCase,
    @inject(TYPES.RejectApplicationUseCase) private _rejectApplicationUseCase: IRejectApplicationUseCase
  ) { }

  // Developer endpoint: Apply to a job
  applyToJob = async (
    request: FastifyRequest<{ Body: CreateApplicationInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const developerId = request.user?.id as string;
    const result = await this._createApplicationUseCase.execute({
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
    const companyContext = this._getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const query = request.query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;

    const result = await this._listApplicationsForCompanyUseCase.execute({
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
      const companyContext = this._getCompanyContext(request);
      companyId = companyContext.companyUserId;
    } else if (userRole === 'interviewer') {
      interviewerId = request.user?.id as string;
    }

    const result = await this._getApplicationDetailsUseCase.execute(applicationId, companyId, interviewerId);
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

    const result = await this._listApplicationsForDeveloperUseCase.execute({
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
    const result = await this._withdrawApplicationUseCase.execute({
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
    const companyContext = this._getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const jobId = request.params.jobId;
    const result = await this._getApplicationMetricsUseCase.execute(jobId, companyId);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  // Company endpoint: Shortlist application
  shortlistApplication = async (
    request: FastifyRequest<{ Params: { id: string }; Body?: { note?: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = this._getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const applicationId = request.params.id;
    const note = request.body?.note?.trim() || undefined;
    const result = await this._shortlistApplicationUseCase.execute({
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
    const companyContext = this._getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const applicationId = request.params.id;
    const note = request.body?.note?.trim() || undefined;
    const result = await this._rejectApplicationUseCase.execute({
      applicationId,
      companyId,
      note,
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  private _getCompanyContext(request: FastifyRequest) {
    const companyContext = request.companyContext;
    if (!companyContext) {
      throw new ForbiddenError('Company context missing. Ensure checkCompanyPaid middleware is applied.');
    }
    return companyContext;
  }
}
