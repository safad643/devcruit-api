import { Collection, ObjectId, WithId, Document } from 'mongodb';
import {
    IOfferLetterRepository,
    CreateOfferLetterProps,
    UpdateOfferLetterProps
} from '../../../domain/repositories/IOfferLetterRepository';
import { OfferLetter, OfferLetterProps, SalaryFrequency, OfferLetterStatus } from '../../../domain/entities/OfferLetter';
import { getMongoDb } from './client';
import { InternalError, NotFoundError } from '../../../domain/errors';
import { injectable } from 'inversify';
import { MongoGenericRepository } from './MongoGenericRepository';
import { toDate, toDateOptional, toArray } from './utils/mapperUtils';

@injectable()
export class OfferLetterRepository
    extends MongoGenericRepository<OfferLetter, CreateOfferLetterProps, UpdateOfferLetterProps>
    implements IOfferLetterRepository {

    protected _collection: Collection;

    constructor() {
        super();
        this._collection = getMongoDb().collection('offerLetters');
    }

    protected _getEntityName(): string {
        return 'OfferLetter';
    }

    protected _mapToEntity(doc: WithId<Document>): OfferLetter {
        return new OfferLetter({
            id: doc._id.toString(),
            applicationId: doc.applicationId,
            version: doc.version,
            jobTitle: doc.jobTitle,
            jobDescription: doc.jobDescription,
            companyName: doc.companyName,
            companyAddress: doc.companyAddress,
            companyLogoUrl: doc.companyLogoUrl,
            signatoryName: doc.signatoryName,
            signatoryDesignation: doc.signatoryDesignation,
            candidateName: doc.candidateName,
            candidateEmail: doc.candidateEmail,
            workArrangement: doc.workArrangement,
            location: doc.location,
            jobType: doc.jobType,
            benefits: doc.benefits,
            offeredSalary: doc.offeredSalary,
            salaryCurrency: doc.salaryCurrency,
            salaryFrequency: doc.salaryFrequency as SalaryFrequency,
            proposedStartDate: toDate(doc.proposedStartDate),
            offerExpirationDate: toDate(doc.offerExpirationDate),
            probationPeriodMonths: doc.probationPeriodMonths,
            noticePeriodDays: doc.noticePeriodDays,
            reportingManager: doc.reportingManager,
            documentsRequired: toArray(doc.documentsRequired),
            additionalTerms: doc.additionalTerms,
            status: doc.status as OfferLetterStatus,
            createdAt: toDate(doc.createdAt),
            acceptedAt: toDateOptional(doc.acceptedAt),
            declinedAt: toDateOptional(doc.declinedAt),
        });
    }

    async create(offerLetter: CreateOfferLetterProps): Promise<OfferLetter> {
        try {
            const now = new Date();
            const result = await this._collection.insertOne({
                applicationId: offerLetter.applicationId,
                version: offerLetter.version,
                jobTitle: offerLetter.jobTitle,
                jobDescription: offerLetter.jobDescription,
                companyName: offerLetter.companyName,
                companyAddress: offerLetter.companyAddress,
                companyLogoUrl: offerLetter.companyLogoUrl,
                signatoryName: offerLetter.signatoryName,
                signatoryDesignation: offerLetter.signatoryDesignation,
                candidateName: offerLetter.candidateName,
                candidateEmail: offerLetter.candidateEmail,
                workArrangement: offerLetter.workArrangement,
                location: offerLetter.location,
                jobType: offerLetter.jobType,
                benefits: offerLetter.benefits,
                offeredSalary: offerLetter.offeredSalary,
                salaryCurrency: offerLetter.salaryCurrency,
                salaryFrequency: offerLetter.salaryFrequency,
                proposedStartDate: offerLetter.proposedStartDate,
                offerExpirationDate: offerLetter.offerExpirationDate,
                probationPeriodMonths: offerLetter.probationPeriodMonths,
                noticePeriodDays: offerLetter.noticePeriodDays,
                reportingManager: offerLetter.reportingManager,
                documentsRequired: offerLetter.documentsRequired,
                additionalTerms: offerLetter.additionalTerms,
                status: offerLetter.status || 'pending',
                createdAt: now,
                acceptedAt: offerLetter.acceptedAt,
                declinedAt: offerLetter.declinedAt,
            });

            return this._mapToEntity({
                _id: result.insertedId,
                ...offerLetter,
                status: offerLetter.status || 'pending',
                createdAt: now,
            });
        } catch (error) {
            throw new InternalError('Failed to create offer letter', error as Error);
        }
    }

    async update(id: string, updates: UpdateOfferLetterProps): Promise<OfferLetter> {
        try {
            if (!ObjectId.isValid(id)) {
                throw new NotFoundError('Offer letter not found');
            }

            const { id: _id, createdAt, ...updateFields } = updates;
            const result = await this._collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateFields },
                { returnDocument: 'after' }
            );

            if (!result) {
                throw new NotFoundError('Offer letter not found');
            }

            return this._mapToEntity(result);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new InternalError('Failed to update offer letter', error as Error);
        }
    }

    async findByApplicationId(applicationId: string): Promise<OfferLetter[]> {
        try {
            const docs = await this._collection
                .find({ applicationId })
                .sort({ version: -1 }) // Latest version first
                .toArray();
            return docs.map(doc => this._mapToEntity(doc));
        } catch (error) {
            throw new InternalError('Failed to find offer letters by application ID', error as Error);
        }
    }

    async findLatestByApplicationId(applicationId: string): Promise<OfferLetter | null> {
        try {
            const doc = await this._collection
                .findOne(
                    { applicationId },
                    { sort: { version: -1 } } // Get the highest version
                );

            if (!doc) return null;
            return this._mapToEntity(doc);
        } catch (error) {
            throw new InternalError('Failed to find latest offer letter', error as Error);
        }
    }
}
