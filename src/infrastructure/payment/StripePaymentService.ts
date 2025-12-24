import { injectable } from 'inversify';
import { IPaymentService, CheckoutSessionResult, WebhookVerifiedEvent } from '../../application/services/IPaymentService';
import { InternalError, ValidationError } from '../../domain/errors';
import Stripe from 'stripe';
import { config } from '../../config';

@injectable()
export class StripePaymentService implements IPaymentService {
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly defaultCurrency: string;
  private readonly stripe: Stripe;

  constructor() {
    this.secretKey = config.stripe.secretKey;
    this.webhookSecret = config.stripe.webhookSecret;
    this.defaultCurrency = config.stripe.currency;
    this.stripe = new Stripe(this.secretKey);
  }

  async createCheckoutSession(params: {
    planId: string;
    planName: string;
    amount: number;
    userId: string;
    successUrl: string;
    cancelUrl: string;
    currency?: string;
  }): Promise<CheckoutSessionResult> {
    const { planId, planName, amount, userId, successUrl, cancelUrl } = params;
    const currency = (params.currency ?? this.defaultCurrency).toLowerCase();

    if (amount <= 0) {
      throw new ValidationError('Invalid plan amount');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: planName,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          planId,  // Store planId for webhook lookup
        },
      });

      if (!session.id) {
        throw new InternalError('Failed to create Stripe session');
      }

      return { sessionId: session.id, url: session.url as string };
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new InternalError('Stripe session creation failed', error as Error);
    }
  }

  async verifyWebhookAndExtractEvent(params: { rawBody: Buffer; signature: string; }): Promise<WebhookVerifiedEvent> {
    const { rawBody, signature } = params;

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch (error) {
      throw new ValidationError('Invalid Stripe webhook signature');
    }

    if (event.type !== 'checkout.session.completed') {
      throw new ValidationError('Unhandled Stripe event type');
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const planId = metadata.planId;

    if (!userId || !planId) {
      throw new ValidationError('Missing metadata in Stripe session');
    }

    return {
      eventType: event.type,
      userId,
      planId,
    };
  }
}
