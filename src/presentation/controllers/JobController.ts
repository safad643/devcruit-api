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
    @inject(TYPES.CreateJobUseCase) private createJobUseCase: ICreateJobUseCase,
    @inject(TYPES.ListJobsUseCase) private listJobsUseCase: IListJobsUseCase,
    @inject(TYPES.DeleteJobUseCase) private deleteJobUseCase: IDeleteJobUseCase,
    @inject(TYPES.CloseJobUseCase) private closeJobUseCase: ICloseJobUseCase,
    @inject(TYPES.OpenJobUseCase) private openJobUseCase: IOpenJobUseCase,
    @inject(TYPES.UpdateJobUseCase) private updateJobUseCase: IUpdateJobUseCase,
    @inject(TYPES.GetJobUseCase) private getJobUseCase: IGetJobUseCase
  ) {}

  createJob = async (
    request: FastifyRequest<{ Body: CreateJobInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    this.ensureJobManagementPermission(request);
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const result = await this.createJobUseCase.execute({ ...request.body, companyId });
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  listJobs = async (
    request: FastifyRequest<{ Querystring: ListJobsQueryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const query = request.query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    
    // Default status to 'open' if not provided
    const status = query.status === undefined ? 'open' : query.status;
    
    const result = await this.listJobsUseCase.execute({
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
    this.ensureJobManagementPermission(request);
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const jobId = request.params.id;
    const result = await this.deleteJobUseCase.execute({ jobId, companyId });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  closeJob = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    this.ensureJobManagementPermission(request);
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const jobId = request.params.id;
    const result = await this.closeJobUseCase.execute({ jobId, companyId });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  openJob = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    this.ensureJobManagementPermission(request);
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const jobId = request.params.id;
    const result = await this.openJobUseCase.execute({ jobId, companyId });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };
  getJob = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const job = await this.getJobUseCase.execute({
      jobId: request.params.id,
      companyId,
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(job));
  };

  updateJob = async (
    request: FastifyRequest<{ Params: { id: string }, Body: UpdateJobInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    this.ensureJobManagementPermission(request);
    const companyContext = this.getCompanyContext(request);
    const companyId = companyContext.companyUserId;
    const jobId = request.params.id;
    
    // Convert validUntil from string to Date if provided
    // The schema provides validUntil as a string, but the use case expects a Date
    const updates: any = { ...request.body };
    if (updates.validUntil !== undefined && typeof updates.validUntil === 'string') {
      updates.validUntil = new Date(updates.validUntil);
    }
    
    const result = await this.updateJobUseCase.execute({
      jobId,
      companyId,
      updates
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  private ensureJobManagementPermission(request: FastifyRequest): void {
    if (request.user?.role !== 'hr') {
      return;
    }

    const companyContext = this.getCompanyContext(request);
    const teamMember = companyContext.teamMember;

    if (!teamMember || !(teamMember instanceof HRProfile)) {
      throw new ForbiddenError('Only HR team members can manage jobs.');
    }

    if (!teamMember.permissions.manageApplications) {
      throw new ForbiddenError('You do not have permission to manage jobs.');
    }
  }

  private getCompanyContext(request: FastifyRequest) {
    const companyContext = request.companyContext;
    if (!companyContext) {
      throw new ForbiddenError('Company context missing. Ensure checkCompanyPaid middleware is applied.');
    }
    return companyContext;
  }
}

