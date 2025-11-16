import { CreateCheckoutSessionInput, CreateCheckoutSessionOutput } from '../CreateCheckoutSessionUseCase';

export interface ICreateCheckoutSessionUseCase {
  execute(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput>;
}

