export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface WebhookVerifiedEvent {
  eventType: string;
  userId: string;
  planId: string;  // Changed from plan: PlanTier
}

export interface IPaymentService {
  createCheckoutSession(params: {
    planId: string;
    planName: string;       // Display name for Stripe
    amount: number;         // Final price in smallest currency unit
    userId: string;
    successUrl: string;
    cancelUrl: string;
    currency?: string;
  }): Promise<CheckoutSessionResult>;

  verifyWebhookAndExtractEvent(params: {
    rawBody: Buffer;
    signature: string;
  }): Promise<WebhookVerifiedEvent>;
}
