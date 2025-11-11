import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { CreateJobUseCase } from '../../application/use-cases/job/CreateJobUseCase';
import { ListJobsUseCase } from '../../application/use-cases/job/ListJobsUseCase';
import { CreateJobInput, ListJobsQueryInput, UpdateJobInput } from '../schemas/job.schema';
import { DeleteJobUseCase } from '../../application/use-cases/job/DeleteJobUseCase';
import { CloseJobUseCase } from '../../application/use-cases/job/CloseJobUseCase';
import { UpdateJobUseCase } from '../../application/use-cases/job/UpdateJobUseCase';
import { GetJobUseCase } from '../../application/use-cases/job/GetJobUseCase';
import { OpenJobUseCase } from '../../application/use-cases/job/OpenJobUseCase';

@injectable()
export class JobController {
  constructor(
    @inject(TYPES.CreateJobUseCase) private createJobUseCase: CreateJobUseCase,
    @inject(TYPES.ListJobsUseCase) private listJobsUseCase: ListJobsUseCase,
    @inject(TYPES.DeleteJobUseCase) private deleteJobUseCase: DeleteJobUseCase,
    @inject(TYPES.CloseJobUseCase) private closeJobUseCase: CloseJobUseCase,
    @inject(TYPES.OpenJobUseCase) private openJobUseCase: OpenJobUseCase,
    @inject(TYPES.UpdateJobUseCase) private updateJobUseCase: UpdateJobUseCase,
    @inject(TYPES.GetJobUseCase) private getJobUseCase: GetJobUseCase
  ) {}

  createJob = async (
    request: FastifyRequest<{ Body: CreateJobInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyId = request.user?.id as string;
    const result = await this.createJobUseCase.execute({ ...request.body, companyId });
    reply.status(201).send(result);
  };

  listJobs = async (
    request: FastifyRequest<{ Querystring: ListJobsQueryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyId = request.user?.id as string;
    const query = request.query;
    
    // Convert string query parameters to integers
    const page = query.page ? (typeof query.page === 'string' ? parseInt(query.page, 10) : query.page) : 1;
    const limit = query.limit ? (typeof query.limit === 'string' ? parseInt(query.limit, 10) : query.limit) : 25;
    
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
    
    reply.status(200).send(result);
  };

  deleteJob = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyId = request.user?.id as string;
    const jobId = request.params.id;
    await this.deleteJobUseCase.execute({ jobId, companyId });
    reply.status(200).send({ message: 'Job deleted successfully' });
  };

  closeJob = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyId = request.user?.id as string;
    const jobId = request.params.id;
    const result = await this.closeJobUseCase.execute({ jobId, companyId });
    reply.status(200).send(result);
  };

  openJob = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyId = request.user?.id as string;
    const jobId = request.params.id;
    const result = await this.openJobUseCase.execute({ jobId, companyId });
    reply.status(200).send(result);
  };
  getJob = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const job = await this.getJobUseCase.execute(request.params.id);
    reply.status(200).send(job);
  };

  updateJob = async (
    request: FastifyRequest<{ Params: { id: string }, Body: UpdateJobInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyId = request.user?.id as string;
    const jobId = request.params.id;
    const result = await this.updateJobUseCase.execute({
      jobId,
      companyId,
      updates: request.body
    });
    reply.status(200).send(result);
  };
}

