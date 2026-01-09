import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { OfferController } from '../controllers/OfferController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { checkCompanyPaid } from '../middleware/checkCompanyPaid';
import {
    ApplicationIdParamsSchema,
    ExtendOfferSchema,
    AcceptOfferSchema,
    DeclineOfferSchema,
    CreateOfferLetterSchema,
    SubmitCounterOfferSchema,
    RejectCounterOfferSchema,
} from '../schemas/application.schema';

export async function offerRoutes(fastify: FastifyInstance): Promise<void> {
    const offerController = container.get<OfferController>(TYPES.OfferController);

    // Company/HR routes with paid check
    fastify.register(async (companyRoutes) => {
        companyRoutes.addHook('preHandler', authenticate);
        companyRoutes.addHook('preHandler', authorize('company', 'hr'));
        companyRoutes.addHook('preHandler', checkCompanyPaid);

        companyRoutes.patch(
            '/company/applications/:id/extend-offer',
            { schema: { params: ApplicationIdParamsSchema, body: ExtendOfferSchema } },
            offerController.extendOffer
        );

        companyRoutes.post(
            '/company/applications/:id/offer-letter',
            { schema: { params: ApplicationIdParamsSchema, body: CreateOfferLetterSchema } },
            offerController.createOfferLetter
        );

        companyRoutes.get(
            '/company/applications/:id/offer-letter',
            { schema: { params: ApplicationIdParamsSchema } },
            offerController.getOfferLetterForCompany
        );

        companyRoutes.patch(
            '/company/applications/:id/reject-counter',
            { schema: { params: ApplicationIdParamsSchema, body: RejectCounterOfferSchema } },
            offerController.rejectCounterOffer
        );
    });

    // Developer routes
    fastify.register(async (developerRoutes) => {
        developerRoutes.addHook('preHandler', authenticate);
        developerRoutes.addHook('preHandler', authorize('developer'));

        developerRoutes.patch(
            '/applications/:id/accept-offer',
            { schema: { params: ApplicationIdParamsSchema, body: AcceptOfferSchema } },
            offerController.acceptOffer
        );

        developerRoutes.patch(
            '/applications/:id/decline-offer',
            { schema: { params: ApplicationIdParamsSchema, body: DeclineOfferSchema } },
            offerController.declineOffer
        );

        developerRoutes.get(
            '/applications/:id/offer-letter',
            { schema: { params: ApplicationIdParamsSchema } },
            offerController.getOfferLetterForDeveloper
        );

        developerRoutes.patch(
            '/applications/:id/counter-offer',
            { schema: { params: ApplicationIdParamsSchema, body: SubmitCounterOfferSchema } },
            offerController.submitCounterOffer
        );
    });
}
