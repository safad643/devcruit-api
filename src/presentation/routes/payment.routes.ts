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
  fastify.register(async (checkoutRoutes) => {
    checkoutRoutes.addHook('preHandler', authenticate);
    checkoutRoutes.addHook('preHandler', authorize('company'));

    checkoutRoutes.post(
      '/checkout',
      { schema: { body: CreateCheckoutSchema } },
      paymentController.checkout
    );
  });

  // Webhook: raw body handling (public, no auth)
  fastify.post(
    '/webhook',
    { config: { rawBody: true } },
    paymentController.webhook
  );
}


