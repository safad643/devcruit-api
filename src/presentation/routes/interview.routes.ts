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
} from '../schemas/application.schema';

export async function interviewRoutes(fastify: FastifyInstance): Promise<void> {
    const interviewController = container.get<InterviewController>(TYPES.InterviewController);

    // Conditional middleware: only checkCompanyPaid for company/hr, not for interviewers
    const checkCompanyPaidIfNeeded = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        if (request.user?.role === 'company' || request.user?.role === 'hr') {
            await checkCompanyPaid(request, reply);
        }
    };

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
        interviewController.scheduleInterviewRound
    );

    // Interviewer routes
    fastify.get(
        '/interviewer/interviews',
        {
            preHandler: [authenticate, authorize('interviewer')]
        },
        interviewController.getInterviewsForInterviewer
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
        interviewController.updateInterviewResult
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
        interviewController.getOrCreateVideoCall,
    );

    fastify.post(
        '/applications/:id/interview-rounds/:roundName/video-call/start',
        {
            preHandler: [authenticate, authorize('interviewer', 'hr', 'company')],
            schema: {
                params: ApplicationInterviewRoundParamsSchema,
            },
        },
        interviewController.startVideoCall,
    );

    fastify.post(
        '/applications/:id/interview-rounds/:roundName/video-call/end',
        {
            preHandler: [authenticate, authorize('interviewer', 'hr', 'company')],
            schema: {
                params: ApplicationInterviewRoundParamsSchema,
            },
        },
        interviewController.endVideoCall,
    );

    // Developer route: Request reschedule
    fastify.post(
        '/developer/applications/:id/interview-rounds/:roundName/request-reschedule',
        {
            preHandler: [authenticate, authorize('developer')],
            schema: {
                params: ApplicationInterviewRoundParamsSchema,
                body: RequestRescheduleSchema,
            },
        },
        interviewController.requestReschedule,
    );

    // Company/HR route: Respond to reschedule request
    fastify.post(
        '/company/applications/:id/interview-rounds/:roundName/respond-reschedule',
        {
            preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
            schema: {
                params: ApplicationInterviewRoundParamsSchema,
                body: RespondToRescheduleSchema,
            },
        },
        interviewController.respondToRescheduleRequest,
    );

    // Company/HR route: Direct reschedule
    fastify.post(
        '/company/applications/:id/interview-rounds/:roundName/reschedule',
        {
            preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
            schema: {
                params: ApplicationInterviewRoundParamsSchema,
                body: RescheduleInterviewSchema,
            },
        },
        interviewController.rescheduleInterview,
    );
}
