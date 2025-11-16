import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { CreateCheckoutSessionUseCase, HandleStripeWebhookUseCase, CompletePaymentUseCase } from '../../application/use-cases/payment';
import { ValidationError } from '../../domain/errors';
import { CreateCheckoutInput } from '../schemas/payment.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.CreateCheckoutSessionUseCase) private createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    @inject(TYPES.HandleStripeWebhookUseCase) private handleStripeWebhookUseCase: HandleStripeWebhookUseCase,
    @inject(TYPES.CompletePaymentUseCase) private completePaymentUseCase: CompletePaymentUseCase
  ) {}

  checkout = async (
    request: FastifyRequest<{ Body: CreateCheckoutInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user!.id;
    const { plan, successUrl, cancelUrl } = request.body;
    const result = await this.createCheckoutSessionUseCase.execute({
      plan,
      userId,
      successUrl,
      cancelUrl,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess({ sessionId: result.sessionId, url: result.url }));
  };

  webhook = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    console.log('Stripe webhook received');
    // Raw body handling will be configured at the route level; here we access request.raw
    const signature = request.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      throw new ValidationError('Missing Stripe signature header');
    }

    // Fastify rawBody not enabled globally; route will provide Buffer
    const raw = (request as any).rawBody as Buffer | undefined;
    if (!raw) {
      throw new ValidationError('Raw body is required for Stripe webhook verification');
    }

    const verified = await this.handleStripeWebhookUseCase.execute({
      rawBody: raw,
      signature,
    });

    await this.completePaymentUseCase.execute({
      userId: verified.userId,
      plan: verified.plan
    });

    reply.status(HttpStatus.OK).send(wrapSuccess({ received: true, eventType: verified.eventType }));
  };
}


