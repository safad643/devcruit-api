export interface CompletePaymentInput {
  userId: string;
  planId: string;
}

export interface CreateCheckoutSessionInput {
  planId: string;
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
  planId: string;
}
