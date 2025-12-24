import { OfferLetterStatus, SalaryFrequency } from '../../domain/entities/OfferLetter';

// Create Offer Letter (Company)
export interface CreateOfferLetterInput {
    applicationId: string;
    companyId: string;

    // Company-provided fields
    offeredSalary: number;
    salaryCurrency: string;
    salaryFrequency: SalaryFrequency;
    proposedStartDate: string; // ISO date string
    offerExpirationDate: string; // ISO date string
    probationPeriodMonths: number;
    noticePeriodDays: number;
    reportingManager?: string;
    documentsRequired: string[];
    additionalTerms?: string;
    signatoryDesignation?: string; // Optional, defaults to "Authorized Representative"
}

export interface CreateOfferLetterOutput {
    id: string;
    applicationId: string;
    version: number;
    status: OfferLetterStatus;
    message: string;
}

// Get Offer Letter
export interface GetOfferLetterOutput {
    id: string;
    applicationId: string;
    version: number;

    // Auto-filled fields
    jobTitle: string;
    jobDescription: string;
    companyName: string;
    companyAddress: string;
    companyLogoUrl?: string;
    signatoryName: string;
    signatoryDesignation: string;
    candidateName: string;
    candidateEmail: string;
    workArrangement: string;
    location?: string;
    jobType: string;
    benefits?: string;

    // Company-entered fields
    offeredSalary: number;
    salaryCurrency: string;
    salaryFrequency: SalaryFrequency;
    proposedStartDate: Date;
    offerExpirationDate: Date;
    probationPeriodMonths: number;
    noticePeriodDays: number;
    reportingManager?: string;
    documentsRequired: string[];
    additionalTerms?: string;

    // Status tracking
    status: OfferLetterStatus;
    createdAt: Date;
    acceptedAt?: Date;
    declinedAt?: Date;
}

// Get all versions
export interface GetOfferLetterVersionsOutput {
    versions: GetOfferLetterOutput[];
    total: number;
}
