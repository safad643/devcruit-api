import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IPaymentService } from '../../services';
import { CreateCheckoutSessionInput, CreateCheckoutSessionOutput } from '../../dtos/payment.dto';

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
    });

    return { sessionId: result.sessionId, url: result.url };
  }
}


