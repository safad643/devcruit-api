import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { CreateJobInput, ListJobsQueryInput, UpdateJobInput } from '../schemas/job.schema';
import {
  ICreateJobUseCase,
  IListJobsUseCase,
  IDeleteJobUseCase,
  ICloseJobUseCase,
  IOpenJobUseCase,
  IUpdateJobUseCase,
  IGetJobUseCase
} from '../../application/use-cases/job/interfaces';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';
import { ForbiddenError } from '../../domain/errors';
import { HRProfile } from '../../domain/entities/HRProfile';

@injectable()
export class JobController {
  constructor(
    @inject(TYPES.CreateJobUseCase) private _createJobUseCase: ICreateJobUseCase,
    @inject(TYPES.ListJobsUseCase) private _listJobsUseCase: IListJobsUseCase,
    @inject(TYPES.DeleteJobUseCase) private _deleteJobUseCase: IDeleteJobUseCase,
    @inject(TYPES.CloseJobUseCase) private _closeJobUseCase: ICloseJobUseCase,
    @inject(TYPES.OpenJobUseCase) private _openJobUseCase: IOpenJobUseCase,
    @inject(TYPES.UpdateJobUseCase) private _updateJobUseCase: IUpdateJobUseCase,
    @inject(TYPES.GetJobUseCase) private _getJobUseCase: IGetJobUseCase
  ) { }

  createJob = async (
    request: FastifyRequest<{ Body: CreateJobInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    this._ensureJobManagementPermission(request);
    const companyContext = this._getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const result = await this._createJobUseCase.execute({ ...request.body, companyId });
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  listJobs = async (
    request: FastifyRequest<{ Querystring: ListJobsQueryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = this._getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const query = request.query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;

    // Default status to 'open' if not provided
    const status = query.status === undefined ? 'open' : query.status;

    const result = await this._listJobsUseCase.execute({
      companyId,
      page,
      limit,
      search: query.search,
      status: status === 'all' ? undefined : status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  deleteJob = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    this._ensureJobManagementPermission(request);
    const companyContext = this._getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const jobId = request.params.id;
    const result = await this._deleteJobUseCase.execute({ jobId, companyId });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  closeJob = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    this._ensureJobManagementPermission(request);
    const companyContext = this._getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const jobId = request.params.id;
    const result = await this._closeJobUseCase.execute({ jobId, companyId });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  openJob = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    this._ensureJobManagementPermission(request);
    const companyContext = this._getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const jobId = request.params.id;
    const result = await this._openJobUseCase.execute({ jobId, companyId });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };
  getJob = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = this._getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const job = await this._getJobUseCase.execute({
      jobId: request.params.id,
      companyId,
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(job));
  };

  updateJob = async (
    request: FastifyRequest<{ Params: { id: string }, Body: UpdateJobInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    this._ensureJobManagementPermission(request);
    const companyContext = this._getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const jobId = request.params.id;

    const result = await this._updateJobUseCase.execute({
      jobId,
      companyId,
      updates: request.body
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  private _ensureJobManagementPermission(request: FastifyRequest): void {
    if (request.user?.role !== 'hr') {
      return;
    }

    const companyContext = this._getCompanyContext(request);
    const teamMember = companyContext.teamMember;

    if (!teamMember || !(teamMember instanceof HRProfile)) {
      throw new ForbiddenError('Only HR team members can manage jobs.');
    }

    if (!teamMember.permissions.manageApplications) {
      throw new ForbiddenError('You do not have permission to manage jobs.');
    }
  }

  private _getCompanyContext(request: FastifyRequest) {
    const companyContext = request.companyContext;
    if (!companyContext) {
      throw new ForbiddenError('Company context missing. Ensure checkCompanyPaid middleware is applied.');
    }
    return companyContext;
  }
}

