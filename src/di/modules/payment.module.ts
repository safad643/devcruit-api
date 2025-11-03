import { ContainerModule } from 'inversify';
import { TYPES } from '../types';
import { CreateCheckoutSessionUseCase, HandleStripeWebhookUseCase, CompletePaymentUseCase } from '../../application/use-cases/payment';
import { PaymentController } from '../../presentation/controllers/PaymentController';

export const paymentModule = new ContainerModule((bind) => {
  bind<CreateCheckoutSessionUseCase>(TYPES.CreateCheckoutSessionUseCase).to(CreateCheckoutSessionUseCase);
  bind<HandleStripeWebhookUseCase>(TYPES.HandleStripeWebhookUseCase).to(HandleStripeWebhookUseCase);
  bind<CompletePaymentUseCase>(TYPES.CompletePaymentUseCase).to(CompletePaymentUseCase);
  bind<PaymentController>(TYPES.PaymentController).to(PaymentController);
});


