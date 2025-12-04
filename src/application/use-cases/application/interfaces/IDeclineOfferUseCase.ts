import { DeclineOfferInput, DeclineOfferOutput } from '../../../dtos/application.dto';

export interface IDeclineOfferUseCase {
  execute(input: DeclineOfferInput): Promise<DeclineOfferOutput>;
}

