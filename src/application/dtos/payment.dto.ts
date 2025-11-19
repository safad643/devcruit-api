import { PlanTier } from '../../domain/entities/CompanyProfile';

export interface CompletePaymentInput {
  userId: string;
  plan: PlanTier;
}

export interface CreateCheckoutSessionInput {
  plan: PlanTier;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionOutput {
  sessionId: string;
  url: string;
}

export interface HandleStripeWebhookInput {
  rawBody: Buffer;
  signature: string;
}

export interface HandleStripeWebhookOutput {
  eventType: string;
  userId: string;
  plan: PlanTier;
}

