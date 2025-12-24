import {
    CreateCheckoutSessionInput,
    CreateCheckoutSessionOutput,
    HandleStripeWebhookInput,
    HandleStripeWebhookOutput,
} from '../../dtos/payment.dto';
import { CompletePaymentWithSessionInput } from './CompletePaymentUseCase';

export interface ICreateCheckoutSessionUseCase {
    execute(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput>;
}

export interface IHandleStripeWebhookUseCase {
    execute(input: HandleStripeWebhookInput): Promise<HandleStripeWebhookOutput>;
}

export interface ICompletePaymentUseCase {
    execute(input: CompletePaymentWithSessionInput): Promise<void>;
}

