import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { PaymentController } from '../controllers/PaymentController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { CreateCheckoutSchema } from '../schemas/payment.schema';

export async function paymentRoutes(fastify: FastifyInstance): Promise<void> {
  const paymentController = container.get<PaymentController>(TYPES.PaymentController);

  // Authenticated company-only checkout
  fastify.post(
    '/checkout',
    {
      preHandler: [authenticate, authorize('company')],
      schema: { body: CreateCheckoutSchema }
    },
    paymentController.checkout
  );

  // Webhook: raw body handling will be added in a later step
  fastify.post(
    '/webhook',
    { config: { rawBody: true } },
    paymentController.webhook
  );
}


