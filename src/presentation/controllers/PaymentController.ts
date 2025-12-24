import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import {
  ICreateCheckoutSessionUseCase,
  IHandleStripeWebhookUseCase,
  ICompletePaymentUseCase,
} from '../../application/use-cases/payment/interfaces';
import { ValidationError } from '../../domain/errors';
import { CreateCheckoutInput } from '../schemas/payment.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.CreateCheckoutSessionUseCase) private createCheckoutSessionUseCase: ICreateCheckoutSessionUseCase,
    @inject(TYPES.HandleStripeWebhookUseCase) private handleStripeWebhookUseCase: IHandleStripeWebhookUseCase,
    @inject(TYPES.CompletePaymentUseCase) private completePaymentUseCase: ICompletePaymentUseCase
  ) { }

  checkout = async (
    request: FastifyRequest<{ Body: CreateCheckoutInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user!.id;
    const { planId, successUrl, cancelUrl } = request.body;
    const result = await this.createCheckoutSessionUseCase.execute({
      planId,
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
    const signature = request.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      throw new ValidationError('Missing Stripe signature header');
    }

    const raw = request.rawBody;
    if (!raw) {
      throw new ValidationError('Raw body is required for Stripe webhook verification');
    }
    const rawBuffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);

    const verified = await this.handleStripeWebhookUseCase.execute({
      rawBody: rawBuffer,
      signature,
    });

    // Extract session ID from the raw body (Stripe event structure)
    let stripeSessionId = '';
    try {
      const eventData = JSON.parse(rawBuffer.toString());
      stripeSessionId = eventData?.data?.object?.id || '';
    } catch {
      // Fallback - shouldn't happen if webhook is valid
      stripeSessionId = `session_${Date.now()}`;
    }

    await this.completePaymentUseCase.execute({
      userId: verified.userId,
      planId: verified.planId,
      stripeSessionId,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess({ received: true, eventType: verified.eventType }));
  };
}
