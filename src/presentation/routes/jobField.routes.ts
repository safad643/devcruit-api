import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { JobFieldController } from '../controllers/JobFieldController';
import { authenticate } from '../middleware/authenticate';
import { GetJobFieldsQuerySchema } from '../schemas/jobField.schema';

// Public job-fields route - only requires authentication, no role restriction
export async function jobFieldRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.addHook('preHandler', authenticate);

    const jobFieldController = container.get<JobFieldController>(TYPES.JobFieldController);

    fastify.get(
        '/job-fields',
        { schema: { querystring: GetJobFieldsQuerySchema } },
        jobFieldController.getAll
    );
}
