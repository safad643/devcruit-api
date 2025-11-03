import { PlanTier } from '../../domain/entities/CompanyProfile';

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface WebhookVerifiedEvent {
  eventType: string;
  userId: string;
  plan: PlanTier;
}

export interface IPaymentService {
  createCheckoutSession(params: {
    plan: PlanTier;
    userId: string;
    successUrl: string;
    cancelUrl: string;
    currency?: string; // default will be set by implementation
  }): Promise<CheckoutSessionResult>;

  verifyWebhookAndExtractEvent(params: {
    rawBody: Buffer;
    signature: string;
  }): Promise<WebhookVerifiedEvent>;
}


