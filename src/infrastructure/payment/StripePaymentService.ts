import { injectable } from 'inversify';
import { IPaymentService, CheckoutSessionResult, WebhookVerifiedEvent } from '../../application/services/IPaymentService';
import { PlanTier } from '../../domain/entities/CompanyProfile';
import { InternalError, ValidationError } from '../../domain/errors';
import Stripe from 'stripe';

export interface StripePaymentServiceOptions {
  secretKey: string;
  webhookSecret: string;
  defaultCurrency?: string; // e.g., 'inr'
}

@injectable()
export class StripePaymentService implements IPaymentService {
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly defaultCurrency: string;
  private readonly stripe: Stripe;

  constructor(options: StripePaymentServiceOptions) {
    this.secretKey = options.secretKey;
    this.webhookSecret = options.webhookSecret;
    this.defaultCurrency = options.defaultCurrency ?? 'inr';
    this.stripe = new Stripe(this.secretKey);
  }

  async createCheckoutSession(params: {
    plan: PlanTier;
    userId: string;
    successUrl: string;
    cancelUrl: string;
    currency?: string;
  }): Promise<CheckoutSessionResult> {
    const { plan, userId, successUrl, cancelUrl } = params;
    const currency = (params.currency ?? this.defaultCurrency).toLowerCase();

    const amountByPlan: Record<PlanTier, number> = {
      Basic: 10000,     // INR 100.00 (in paise)
      Standard: 20000,  // INR 200.00
      Premium: 30000,   // INR 300.00
    };

    const unitAmount = amountByPlan[plan];
    if (!unitAmount) {
      throw new ValidationError('Invalid plan selected');
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
                name: `${plan} Plan`,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          plan,
        },
      });

      if (!session.id) {
        throw new InternalError('Failed to create Stripe session');
      }

      return { sessionId: session.id, url: session.url as string };
    } catch (error) {
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
    const planStr = metadata.plan as string | undefined;

    if (!userId || !planStr) {
      throw new ValidationError('Missing metadata in Stripe session');
    }

    const allowedPlans: PlanTier[] = ['Basic', 'Standard', 'Premium'];
    if (!allowedPlans.includes(planStr as PlanTier)) {
      throw new ValidationError('Invalid plan in Stripe metadata');
    }

    return {
      eventType: event.type,
      userId,
      plan: planStr as PlanTier,
    };
  }
}


