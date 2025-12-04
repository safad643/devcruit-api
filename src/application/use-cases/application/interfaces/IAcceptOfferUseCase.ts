import { AcceptOfferInput, AcceptOfferOutput } from '../../../dtos/application.dto';

export interface IAcceptOfferUseCase {
  execute(input: AcceptOfferInput): Promise<AcceptOfferOutput>;
}

