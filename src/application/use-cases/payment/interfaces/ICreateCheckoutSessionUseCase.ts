import { CreateCheckoutSessionInput, CreateCheckoutSessionOutput } from '../../../dtos/payment.dto';

export interface ICreateCheckoutSessionUseCase {
  execute(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput>;
}

