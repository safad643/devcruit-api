import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { PublicJobController } from '../controllers/PublicJobController';
import { PublicListJobsQuerySchema, PublicJobIdParamsSchema } from '../schemas/public.job.schema';

export async function publicJobRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.get<PublicJobController>(TYPES.PublicJobController);

  fastify.get(
    '/',
    {
      schema: { querystring: PublicListJobsQuerySchema }
    },
    controller.list
  );

  fastify.get(
    '/:id',
    {
      schema: { params: PublicJobIdParamsSchema }
    },
    controller.get
  );
}


