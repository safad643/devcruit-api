import { CompletePaymentInput } from '../../../dtos/payment.dto';

export interface ICompletePaymentUseCase {
  execute(input: CompletePaymentInput): Promise<void>;
}

