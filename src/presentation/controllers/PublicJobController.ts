import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { PublicListJobsUseCase } from '../../application/use-cases/job/PublicListJobsUseCase';
import { PublicGetJobUseCase } from '../../application/use-cases/job/PublicGetJobUseCase';
import { PublicListJobsQueryInput } from '../schemas/public.job.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

@injectable()
export class PublicJobController {
  constructor(
    @inject(TYPES.PublicListJobsUseCase) private listUseCase: PublicListJobsUseCase,
    @inject(TYPES.PublicGetJobUseCase) private getUseCase: PublicGetJobUseCase
  ) {}

  list = async (
    request: FastifyRequest<{ Querystring: PublicListJobsQueryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const q = request.query;
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;

    const result = await this.listUseCase.execute({
      page,
      limit,
      query: q.query,
      company: q.company,
      location: q.location,
      jobType: q.jobType,
      workArrangement: q.workArrangement,
      experienceLevel: q.experienceLevel,
      sortBy: q.sortBy,
      sortOrder: q.sortOrder,
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  get = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const job = await this.getUseCase.execute(request.params.id);
    reply.status(HttpStatus.OK).send(wrapSuccess(job));
  };
}


