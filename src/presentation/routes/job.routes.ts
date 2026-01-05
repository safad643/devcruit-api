import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { JobController } from '../controllers/JobController';
import { JobFieldController } from '../controllers/JobFieldController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { checkCompanyPaid } from '../middleware/checkCompanyPaid';
import { CreateJobSchema, ListJobsQuerySchema, JobIdParamsSchema, UpdateJobSchema } from '../schemas/job.schema';
import { GetJobFieldsQuerySchema } from '../schemas/jobField.schema';

export async function jobRoutes(fastify: FastifyInstance): Promise<void> {
  const jobController = container.get<JobController>(TYPES.JobController);

  // Most routes need company auth + paid check
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', authorize('company', 'hr'));
  fastify.addHook('preHandler', checkCompanyPaid);

  fastify.post(
    '/jobs',
    { schema: { body: CreateJobSchema } },
    jobController.createJob
  );

  fastify.get(
    '/jobs',
    { schema: { querystring: ListJobsQuerySchema } },
    jobController.listJobs
  );

  fastify.delete(
    '/jobs/:id',
    { schema: { params: JobIdParamsSchema } },
    jobController.deleteJob
  );

  fastify.post(
    '/jobs/:id/close',
    { schema: { params: JobIdParamsSchema } },
    jobController.closeJob
  );

  fastify.post(
    '/jobs/:id/open',
    { schema: { params: JobIdParamsSchema } },
    jobController.openJob
  );

  fastify.get(
    '/jobs/:id',
    { schema: { params: JobIdParamsSchema } },
    jobController.getJob
  );

  fastify.put(
    '/jobs/:id',
    { schema: { params: JobIdParamsSchema, body: UpdateJobSchema } },
    jobController.updateJob
  );

  // Exception: job-fields only needs authenticate (no role/paid check)
  fastify.register(async (authOnlyRoutes) => {
    authOnlyRoutes.addHook('preHandler', authenticate);

    const jobFieldController = container.get<JobFieldController>(TYPES.JobFieldController);
    authOnlyRoutes.get(
      '/job-fields',
      { schema: { querystring: GetJobFieldsQuerySchema } },
      jobFieldController.getAll
    );
  });
}

