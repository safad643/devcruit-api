import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IPaymentService } from '../../services';
import { PlanTier } from '../../../domain/entities/CompanyProfile';

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

@injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @inject(TYPES.PaymentService) private paymentService: IPaymentService
  ) {}

  async execute(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput> {
    const result = await this.paymentService.createCheckoutSession({
      plan: input.plan,
      userId: input.userId,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      currency: 'inr',
    });

    return { sessionId: result.sessionId, url: result.url };
  }
}


