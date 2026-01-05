import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { InterviewController } from '../controllers/InterviewController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { checkCompanyPaid } from '../middleware/checkCompanyPaid';
import {
    ApplicationIdParamsSchema,
    ScheduleInterviewRoundSchema,
    UpdateInterviewResultSchema,
    ApplicationInterviewRoundParamsSchema,
    RequestRescheduleSchema,
    RespondToRescheduleSchema,
    RescheduleInterviewSchema,
    AddInterviewRoundSchema,
} from '../schemas/application.schema';

export async function interviewRoutes(fastify: FastifyInstance): Promise<void> {
    const interviewController = container.get<InterviewController>(TYPES.InterviewController);

    // Company/HR routes with paid check
    fastify.register(async (companyRoutes) => {
        companyRoutes.addHook('preHandler', authenticate);
        companyRoutes.addHook('preHandler', authorize('company', 'hr'));
        companyRoutes.addHook('preHandler', checkCompanyPaid);

        companyRoutes.post(
            '/company/applications/:id/schedule-interview',
            { schema: { params: ApplicationIdParamsSchema, body: ScheduleInterviewRoundSchema } },
            interviewController.scheduleInterviewRound
        );

        companyRoutes.post(
            '/company/applications/:id/add-interview-round',
            { schema: { params: ApplicationIdParamsSchema, body: AddInterviewRoundSchema } },
            interviewController.addInterviewRound
        );

        companyRoutes.post(
            '/company/applications/:id/interview-rounds/:roundName/respond-reschedule',
            { schema: { params: ApplicationInterviewRoundParamsSchema, body: RespondToRescheduleSchema } },
            interviewController.respondToRescheduleRequest
        );

        companyRoutes.post(
            '/company/applications/:id/interview-rounds/:roundName/reschedule',
            { schema: { params: ApplicationInterviewRoundParamsSchema, body: RescheduleInterviewSchema } },
            interviewController.rescheduleInterview
        );
    });

    // Interviewer-only routes
    fastify.register(async (interviewerRoutes) => {
        interviewerRoutes.addHook('preHandler', authenticate);
        interviewerRoutes.addHook('preHandler', authorize('interviewer'));

        interviewerRoutes.get(
            '/interviewer/interviews',
            {},
            interviewController.getInterviewsForInterviewer
        );

        interviewerRoutes.post(
            '/interviewer/applications/:id/update-interview-result',
            { schema: { params: ApplicationIdParamsSchema, body: UpdateInterviewResultSchema } },
            interviewController.updateInterviewResult
        );
    });

    // Video call routes - all roles
    fastify.register(async (videoAllRoutes) => {
        videoAllRoutes.addHook('preHandler', authenticate);
        videoAllRoutes.addHook('preHandler', authorize('developer', 'interviewer', 'hr', 'company'));

        videoAllRoutes.post(
            '/applications/:id/interview-rounds/:roundName/video-call',
            { schema: { params: ApplicationInterviewRoundParamsSchema } },
            interviewController.getOrCreateVideoCall
        );
    });

    // Video call routes - interviewer/hr/company only
    fastify.register(async (videoHostRoutes) => {
        videoHostRoutes.addHook('preHandler', authenticate);
        videoHostRoutes.addHook('preHandler', authorize('interviewer', 'hr', 'company'));

        videoHostRoutes.post(
            '/applications/:id/interview-rounds/:roundName/video-call/start',
            { schema: { params: ApplicationInterviewRoundParamsSchema } },
            interviewController.startVideoCall
        );

        videoHostRoutes.post(
            '/applications/:id/interview-rounds/:roundName/video-call/end',
            { schema: { params: ApplicationInterviewRoundParamsSchema } },
            interviewController.endVideoCall
        );
    });

    // Developer-only routes
    fastify.register(async (developerRoutes) => {
        developerRoutes.addHook('preHandler', authenticate);
        developerRoutes.addHook('preHandler', authorize('developer'));

        developerRoutes.post(
            '/developer/applications/:id/interview-rounds/:roundName/request-reschedule',
            { schema: { params: ApplicationInterviewRoundParamsSchema, body: RequestRescheduleSchema } },
            interviewController.requestReschedule
        );
    });
}

