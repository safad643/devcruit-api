import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
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
  RejectApplicationSchema,
} from '../schemas/application.schema';

export async function applicationRoutes(fastify: FastifyInstance): Promise<void> {
  const applicationController = container.get<ApplicationController>(TYPES.ApplicationController);

  // Developer routes sub-plugin
  fastify.register(async (developerRoutes) => {
    developerRoutes.addHook('preHandler', authenticate);
    developerRoutes.addHook('preHandler', authorize('developer'));

    developerRoutes.post(
      '/applications',
      { schema: { body: CreateApplicationSchema } },
      applicationController.applyToJob
    );

    developerRoutes.get(
      '/applications',
      { schema: { querystring: ListApplicationsForDeveloperQuerySchema } },
      applicationController.listApplicationsForDeveloper
    );

    developerRoutes.post(
      '/applications/withdraw',
      { schema: { body: WithdrawApplicationSchema } },
      applicationController.withdrawApplication
    );

    developerRoutes.get(
      '/applications/:id',
      { schema: { params: ApplicationIdParamsSchema } },
      applicationController.getDeveloperApplicationDetails
    );
  });

  // Company routes sub-plugin (company/hr with paid check)
  fastify.register(async (companyRoutes) => {
    companyRoutes.addHook('preHandler', authenticate);
    companyRoutes.addHook('preHandler', authorize('company', 'hr'));
    companyRoutes.addHook('preHandler', checkCompanyPaid);

    companyRoutes.get(
      '/company/applications',
      { schema: { querystring: ListApplicationsForCompanyQuerySchema } },
      applicationController.listApplicationsForCompany
    );

    companyRoutes.get(
      '/company/applications/job/:jobId/metrics',
      { schema: { params: Type.Object({ jobId: Type.String({ minLength: 1 }) }) } },
      applicationController.getApplicationMetrics
    );

    companyRoutes.patch(
      '/company/applications/:id/shortlist',
      { schema: { params: ApplicationIdParamsSchema, body: UpdateApplicationStatusSchema } },
      applicationController.shortlistApplication
    );

    companyRoutes.patch(
      '/company/applications/:id/reject',
      { schema: { params: ApplicationIdParamsSchema, body: RejectApplicationSchema } },
      applicationController.rejectApplication
    );
  });

  // Mixed access route (company/hr/interviewer with conditional paid check)
  fastify.register(async (mixedRoutes) => {
    mixedRoutes.addHook('preHandler', authenticate);
    mixedRoutes.addHook('preHandler', authorize('company', 'hr', 'interviewer'));

    const checkCompanyPaidIfNeeded = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      if (request.user?.role === 'company' || request.user?.role === 'hr') {
        await checkCompanyPaid(request, reply);
      }
    };
    mixedRoutes.addHook('preHandler', checkCompanyPaidIfNeeded);

    mixedRoutes.get(
      '/company/applications/:id',
      { schema: { params: ApplicationIdParamsSchema } },
      applicationController.getApplicationDetails
    );
  });
}
