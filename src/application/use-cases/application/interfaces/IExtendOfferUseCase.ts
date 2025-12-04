import { ExtendOfferInput, ExtendOfferOutput } from '../../../dtos/application.dto';

export interface IExtendOfferUseCase {
  execute(input: ExtendOfferInput): Promise<ExtendOfferOutput>;
}

