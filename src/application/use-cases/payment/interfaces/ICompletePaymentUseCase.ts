import { CompletePaymentInput } from '../CompletePaymentUseCase';

export interface ICompletePaymentUseCase {
  execute(input: CompletePaymentInput): Promise<void>;
}

