import {
    CreateOfferLetterInput,
    CreateOfferLetterOutput,
    GetOfferLetterOutput,
    GetOfferLetterVersionsOutput,
} from '../../dtos/offerLetter.dto';

export interface ICreateOfferLetterUseCase {
    execute(input: CreateOfferLetterInput): Promise<CreateOfferLetterOutput>;
}

export interface IGetOfferLetterUseCase {
    execute(applicationId: string, userId: string, userRole: 'company' | 'developer'): Promise<GetOfferLetterOutput>;
}

export interface IGetOfferLetterByIdUseCase {
    execute(offerId: string, userId: string, userRole: 'company' | 'developer'): Promise<GetOfferLetterOutput>;
}

export interface IGetOfferLetterVersionsUseCase {
    execute(applicationId: string, companyId: string): Promise<GetOfferLetterVersionsOutput>;
}
