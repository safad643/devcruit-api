import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { CreateApplicationUseCase } from '../../application/use-cases/application/CreateApplicationUseCase';
import { ListApplicationsForCompanyUseCase } from '../../application/use-cases/application/ListApplicationsForCompanyUseCase';
import { GetApplicationDetailsUseCase } from '../../application/use-cases/application/GetApplicationDetailsUseCase';
import { ListApplicationsForDeveloperUseCase } from '../../application/use-cases/application/ListApplicationsForDeveloperUseCase';
import { WithdrawApplicationUseCase } from '../../application/use-cases/application/WithdrawApplicationUseCase';
import { GetApplicationMetricsUseCase } from '../../application/use-cases/application/GetApplicationMetricsUseCase';
import { UpdateApplicationStatusUseCase } from '../../application/use-cases/application/UpdateApplicationStatusUseCase';
import { 
  CreateApplicationInput, 
  ListApplicationsForCompanyQueryInput,
  ListApplicationsForDeveloperQueryInput,
  WithdrawApplicationInput,
  UpdateApplicationStatusInput
} from '../schemas/application.schema';

@injectable()
export class ApplicationController {
  constructor(
    @inject(TYPES.CreateApplicationUseCase) private createApplicationUseCase: CreateApplicationUseCase,
    @inject(TYPES.ListApplicationsForCompanyUseCase) private listApplicationsForCompanyUseCase: ListApplicationsForCompanyUseCase,
    @inject(TYPES.GetApplicationDetailsUseCase) private getApplicationDetailsUseCase: GetApplicationDetailsUseCase,
    @inject(TYPES.ListApplicationsForDeveloperUseCase) private listApplicationsForDeveloperUseCase: ListApplicationsForDeveloperUseCase,
    @inject(TYPES.WithdrawApplicationUseCase) private withdrawApplicationUseCase: WithdrawApplicationUseCase,
    @inject(TYPES.GetApplicationMetricsUseCase) private getApplicationMetricsUseCase: GetApplicationMetricsUseCase,
    @inject(TYPES.UpdateApplicationStatusUseCase) private updateApplicationStatusUseCase: UpdateApplicationStatusUseCase
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
    reply.status(201).send(result);
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
    
    reply.status(200).send(result);
  };

  // Company endpoint: Get application details
  getApplicationDetails = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyId = request.user?.id as string;
    const applicationId = request.params.id;
    const result = await this.getApplicationDetailsUseCase.execute(applicationId, companyId);
    reply.status(200).send(result);
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
    
    reply.status(200).send(result);
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
    reply.status(200).send(result);
  };

  // Company endpoint: Get application metrics for a job
  getApplicationMetrics = async (
    request: FastifyRequest<{ Params: { jobId: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyId = request.user?.id as string;
    const jobId = request.params.jobId;
    const result = await this.getApplicationMetricsUseCase.execute(jobId, companyId);
    reply.status(200).send(result);
  };

  // Company endpoint: Update application status
  updateApplicationStatus = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateApplicationStatusInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyId = request.user?.id as string;
    const applicationId = request.params.id;
    const result = await this.updateApplicationStatusUseCase.execute({
      applicationId,
      companyId,
      ...request.body,
    });
    reply.status(200).send(result);
  };
}

