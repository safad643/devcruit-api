import { HandleStripeWebhookInput, HandleStripeWebhookOutput } from '../HandleStripeWebhookUseCase';

export interface IHandleStripeWebhookUseCase {
  execute(input: HandleStripeWebhookInput): Promise<HandleStripeWebhookOutput>;
}

