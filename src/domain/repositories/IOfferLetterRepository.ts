import { OfferLetter, OfferLetterProps } from '../entities/OfferLetter';
import { IGenericRepository } from './IGenericRepository';

export type CreateOfferLetterProps = Omit<OfferLetterProps, 'id' | 'createdAt' | 'status'> & {
    status?: string;
};

export type UpdateOfferLetterProps = Partial<OfferLetterProps>;

export interface IOfferLetterRepository extends IGenericRepository<OfferLetter, CreateOfferLetterProps, UpdateOfferLetterProps> {
    /**
     * Find all offer letter versions for an application
     */
    findByApplicationId(applicationId: string): Promise<OfferLetter[]>;

    /**
     * Find the latest (highest version) offer letter for an application
     */
    findLatestByApplicationId(applicationId: string): Promise<OfferLetter | null>;
}
