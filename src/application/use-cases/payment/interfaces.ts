import {
    CompletePaymentInput,
    CreateCheckoutSessionInput,
    CreateCheckoutSessionOutput,
    HandleStripeWebhookInput,
    HandleStripeWebhookOutput,
} from '../../dtos/payment.dto';

export interface ICreateCheckoutSessionUseCase {
    execute(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput>;
}

export interface IHandleStripeWebhookUseCase {
    execute(input: HandleStripeWebhookInput): Promise<HandleStripeWebhookOutput>;
}

export interface ICompletePaymentUseCase {
    execute(input: CompletePaymentInput): Promise<void>;
}
