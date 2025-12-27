import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IPaymentService } from '../../services';
import { HandleStripeWebhookInput, HandleStripeWebhookOutput } from '../../dtos/payment.dto';

@injectable()
export class HandleStripeWebhookUseCase {
  constructor(
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService
  ) { }

  async execute(input: HandleStripeWebhookInput): Promise<HandleStripeWebhookOutput> {
    const verified = await this._paymentService.verifyWebhookAndExtractEvent({
      rawBody: input.rawBody,
      signature: input.signature,
    });

    return {
      eventType: verified.eventType,
      userId: verified.userId,
      planId: verified.planId,
    };
  }
}
