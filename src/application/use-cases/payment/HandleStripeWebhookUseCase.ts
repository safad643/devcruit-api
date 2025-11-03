import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IPaymentService } from '../../services';
import { PlanTier } from '../../../domain/entities/CompanyProfile';

export interface HandleStripeWebhookInput {
  rawBody: Buffer;
  signature: string;
}

export interface HandleStripeWebhookOutput {
  eventType: string;
  userId: string;
  plan: PlanTier;
}

@injectable()
export class HandleStripeWebhookUseCase {
  constructor(
    @inject(TYPES.PaymentService) private paymentService: IPaymentService
  ) {}

  async execute(input: HandleStripeWebhookInput): Promise<HandleStripeWebhookOutput> {
    const verified = await this.paymentService.verifyWebhookAndExtractEvent({
      rawBody: input.rawBody,
      signature: input.signature,
    });

    return {
      eventType: verified.eventType,
      userId: verified.userId,
      plan: verified.plan,
    };
  }
}


