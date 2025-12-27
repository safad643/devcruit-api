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
    CreateOfferLetterSchema
} from '../schemas/application.schema';

export async function offerRoutes(fastify: FastifyInstance): Promise<void> {
    const offerController = container.get<OfferController>(TYPES.OfferController);

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
        offerController.extendOffer
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
        offerController.acceptOffer
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
        offerController.declineOffer
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
        offerController.createOfferLetter
    );

    // Company route: Get offer letter
    fastify.get(
        '/company/applications/:id/offer-letter',
        {
            preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid],
            schema: { params: ApplicationIdParamsSchema }
        },
        offerController.getOfferLetterForCompany
    );

    // Developer route: Get offer letter
    fastify.get(
        '/applications/:id/offer-letter',
        {
            preHandler: [authenticate, authorize('developer')],
            schema: { params: ApplicationIdParamsSchema }
        },
        offerController.getOfferLetterForDeveloper
    );
}
