import { HandleStripeWebhookInput, HandleStripeWebhookOutput } from '../../../dtos/payment.dto';

export interface IHandleStripeWebhookUseCase {
  execute(input: HandleStripeWebhookInput): Promise<HandleStripeWebhookOutput>;
}

