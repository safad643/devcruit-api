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
  ScheduleInterviewRoundSchema,
  UpdateInterviewResultSchema,
  ApplicationInterviewRoundParamsSchema,
  ExtendOfferSchema,
  AcceptOfferSchema,
  DeclineOfferSchema,
  CreateOfferLetterSchema
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
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: { querystring: ListApplicationsForCompanyQuerySchema }
    },
    applicationController.listApplicationsForCompany
  );

  // Conditional middleware: only checkCompanyPaid for company/hr, not for interviewers
  const checkCompanyPaidIfNeeded = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (request.user?.role === 'company' || request.user?.role === 'hr') {
      await checkCompanyPaid(request, reply);
    }
  };

  fastify.get(
    '/company/applications/:id',
    {
      preHandler: [authenticate, authorize('company', 'hr', 'interviewer'), checkCompanyPaidIfNeeded],
      schema: { params: ApplicationIdParamsSchema }
    },
    applicationController.getApplicationDetails
  );

  fastify.get(
    '/company/applications/job/:jobId/metrics',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: { params: Type.Object({ jobId: Type.String({ minLength: 1 }) }) }
    },
    applicationController.getApplicationMetrics
  );

  fastify.patch(
    '/company/applications/:id/shortlist',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
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
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: {
        params: ApplicationIdParamsSchema,
        body: RejectApplicationSchema
      }
    },
    applicationController.rejectApplication
  );

  // Company/HR route: Schedule interview round
  fastify.post(
    '/company/applications/:id/schedule-interview',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: {
        params: ApplicationIdParamsSchema,
        body: ScheduleInterviewRoundSchema
      }
    },
    applicationController.scheduleInterviewRound
  );

  // Interviewer routes
  fastify.get(
    '/interviewer/interviews',
    {
      preHandler: [authenticate, authorize('interviewer')]
    },
    applicationController.getInterviewsForInterviewer
  );

  fastify.post(
    '/interviewer/applications/:id/update-interview-result',
    {
      preHandler: [authenticate, authorize('interviewer')],
      schema: {
        params: ApplicationIdParamsSchema,
        body: UpdateInterviewResultSchema
      }
    },
    applicationController.updateInterviewResult
  );

  // Video call routes (shared between developer/interviewer/hr/company as appropriate)
  fastify.post(
    '/applications/:id/interview-rounds/:roundName/video-call',
    {
      preHandler: [authenticate, authorize('developer', 'interviewer', 'hr', 'company')],
      schema: {
        params: ApplicationInterviewRoundParamsSchema,
      },
    },
    applicationController.getOrCreateVideoCall,
  );

  fastify.post(
    '/applications/:id/interview-rounds/:roundName/video-call/start',
    {
      preHandler: [authenticate, authorize('interviewer', 'hr', 'company')],
      schema: {
        params: ApplicationInterviewRoundParamsSchema,
      },
    },
    applicationController.startVideoCall,
  );

  fastify.post(
    '/applications/:id/interview-rounds/:roundName/video-call/end',
    {
      preHandler: [authenticate, authorize('interviewer', 'hr', 'company')],
      schema: {
        params: ApplicationInterviewRoundParamsSchema,
      },
    },
    applicationController.endVideoCall,
  );

  // Company route: Extend offer
  fastify.patch(
    '/company/applications/:id/extend-offer',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: {
        params: ApplicationIdParamsSchema,
        body: ExtendOfferSchema
      }
    },
    applicationController.extendOffer
  );

  // Developer route: Accept offer
  fastify.patch(
    '/applications/:id/accept-offer',
    {
      preHandler: [authenticate, authorize('developer')],
      schema: {
        params: ApplicationIdParamsSchema,
        body: AcceptOfferSchema
      }
    },
    applicationController.acceptOffer
  );

  // Developer route: Decline offer
  fastify.patch(
    '/applications/:id/decline-offer',
    {
      preHandler: [authenticate, authorize('developer')],
      schema: {
        params: ApplicationIdParamsSchema,
        body: DeclineOfferSchema
      }
    },
    applicationController.declineOffer
  );

  // Company route: Create offer letter
  fastify.post(
    '/company/applications/:id/offer-letter',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: {
        params: ApplicationIdParamsSchema,
        body: CreateOfferLetterSchema
      }
    },
    applicationController.createOfferLetter
  );

  // Company route: Get offer letter
  fastify.get(
    '/company/applications/:id/offer-letter',
    {
      preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
      schema: { params: ApplicationIdParamsSchema }
    },
    applicationController.getOfferLetterForCompany
  );

  // Developer route: Get offer letter
  fastify.get(
    '/applications/:id/offer-letter',
    {
      preHandler: [authenticate, authorize('developer')],
      schema: { params: ApplicationIdParamsSchema }
    },
    applicationController.getOfferLetterForDeveloper
  );
}

