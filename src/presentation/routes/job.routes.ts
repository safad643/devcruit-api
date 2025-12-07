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

  fastify.post(
    '/jobs',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: { body: CreateJobSchema }
    },
    jobController.createJob
  );

  fastify.get(
    '/jobs',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: { querystring: ListJobsQuerySchema }
    },
    jobController.listJobs
  );

  fastify.delete(
    '/jobs/:id',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: { params: JobIdParamsSchema }
    },
    jobController.deleteJob
  );

  fastify.post(
    '/jobs/:id/close',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: { params: JobIdParamsSchema }
    },
    jobController.closeJob
  );

  fastify.post(
    '/jobs/:id/open',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: { params: JobIdParamsSchema }
    },
    jobController.openJob
  );

  fastify.get(
    '/jobs/:id',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: { params: JobIdParamsSchema }
    },
    jobController.getJob
  );

  fastify.put(
    '/jobs/:id',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: { params: JobIdParamsSchema, body: UpdateJobSchema }
    },
    jobController.updateJob
  );

  // Public job fields endpoint for companies to fetch dynamic options
  const jobFieldController = container.get<JobFieldController>(TYPES.JobFieldController);

  fastify.get(
    '/job-fields',
    {
      preHandler: [authenticate],
      schema: { querystring: GetJobFieldsQuerySchema }
    },
    jobFieldController.getAll
  );
}

