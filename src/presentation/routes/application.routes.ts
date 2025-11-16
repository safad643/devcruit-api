import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ApplicationController } from '../controllers/ApplicationController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { checkCompanyPaid } from '../middleware/checkCompanyPaid';
import { Type } from '@sinclair/typebox';
import { 
  CreateApplicationSchema, 
  ListApplicationsForCompanyQuerySchema,
  ApplicationIdParamsSchema,
  ListApplicationsForDeveloperQuerySchema,
  WithdrawApplicationSchema,
  UpdateApplicationStatusSchema,
  RejectApplicationSchema
} from '../schemas/application.schema';

export async function applicationRoutes(fastify: FastifyInstance): Promise<void> {
  const applicationController = container.get<ApplicationController>(TYPES.ApplicationController);

  // Developer routes
  fastify.post(
    '/applications',
    {
      preHandler: [authenticate, authorize('developer')],
      schema: { body: CreateApplicationSchema }
    },
    applicationController.applyToJob
  );

  fastify.get(
    '/applications',
    {
      preHandler: [authenticate, authorize('developer')],
      schema: { querystring: ListApplicationsForDeveloperQuerySchema }
    },
    applicationController.listApplicationsForDeveloper
  );

  fastify.post(
    '/applications/withdraw',
    {
      preHandler: [authenticate, authorize('developer')],
      schema: { body: WithdrawApplicationSchema }
    },
    applicationController.withdrawApplication
  );

  // Company routes
  fastify.get(
    '/company/applications',
    {
      preHandler: [authenticate, authorize('company'), checkCompanyPaid],
      schema: { querystring: ListApplicationsForCompanyQuerySchema }
    },
    applicationController.listApplicationsForCompany
  );

  fastify.get(
    '/company/applications/:id',
    {
      preHandler: [authenticate, authorize('company'), checkCompanyPaid],
      schema: { params: ApplicationIdParamsSchema }
    },
    applicationController.getApplicationDetails
  );

  fastify.get(
    '/company/applications/job/:jobId/metrics',
    {
      preHandler: [authenticate, authorize('company'), checkCompanyPaid],
      schema: { params: Type.Object({ jobId: Type.String({ minLength: 1 }) }) }
    },
    applicationController.getApplicationMetrics
  );

  fastify.patch(
    '/company/applications/:id/shortlist',
    {
      preHandler: [authenticate, authorize('company'), checkCompanyPaid],
      schema: { 
        params: ApplicationIdParamsSchema,
        body: UpdateApplicationStatusSchema
      }
    },
    applicationController.shortlistApplication
  );

  fastify.patch(
    '/company/applications/:id/reject',
    {
      preHandler: [authenticate, authorize('company'), checkCompanyPaid],
      schema: { 
        params: ApplicationIdParamsSchema,
        body: RejectApplicationSchema
      }
    },
    applicationController.rejectApplication
  );
}

