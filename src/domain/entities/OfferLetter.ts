// Offer Letter Status
export type OfferLetterStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revised';

// Salary frequency
export type SalaryFrequency = 'monthly' | 'annual';

export interface OfferLetterProps {
    id: string;
    applicationId: string;      // Reference to Application
    version: number;            // 1, 2, 3... for versioning

    // Auto-filled from existing data
    jobTitle: string;
    jobDescription: string;
    companyName: string;
    companyAddress: string;
    companyLogoUrl?: string;
    signatoryName: string;      // From CompanyProfile.fullName
    signatoryDesignation: string; // Default: "Authorized Representative"
    candidateName: string;
    candidateEmail: string;
    workArrangement: string;
    location?: string;
    jobType: string;
    benefits?: string;

    // Company enters at offer time
    offeredSalary: number;
    salaryCurrency: string;
    salaryFrequency: SalaryFrequency;
    proposedStartDate: Date;
    offerExpirationDate: Date;
    probationPeriodMonths: number;
    noticePeriodDays: number;
    reportingManager?: string;
    documentsRequired: string[];  // Checklist items
    additionalTerms?: string;

    // Status tracking
    status: OfferLetterStatus;
    createdAt: Date;
    acceptedAt?: Date;
    declinedAt?: Date;
}

export class OfferLetter {
    public readonly id: string;
    public readonly applicationId: string;
    public readonly version: number;

    // Auto-filled fields
    public readonly jobTitle: string;
    public readonly jobDescription: string;
    public readonly companyName: string;
    public readonly companyAddress: string;
    public readonly companyLogoUrl?: string;
    public readonly signatoryName: string;
    public readonly signatoryDesignation: string;
    public readonly candidateName: string;
    public readonly candidateEmail: string;
    public readonly workArrangement: string;
    public readonly location?: string;
    public readonly jobType: string;
    public readonly benefits?: string;

    // Company-entered fields
    public readonly offeredSalary: number;
    public readonly salaryCurrency: string;
    public readonly salaryFrequency: SalaryFrequency;
    public readonly proposedStartDate: Date;
    public readonly offerExpirationDate: Date;
    public readonly probationPeriodMonths: number;
    public readonly noticePeriodDays: number;
    public readonly reportingManager?: string;
    public readonly documentsRequired: string[];
    public readonly additionalTerms?: string;

    // Status tracking
    public readonly status: OfferLetterStatus;
    public readonly createdAt: Date;
    public readonly acceptedAt?: Date;
    public readonly declinedAt?: Date;

    constructor(props: OfferLetterProps) {
        this.id = props.id;
        this.applicationId = props.applicationId;
        this.version = props.version;
        this.jobTitle = props.jobTitle;
        this.jobDescription = props.jobDescription;
        this.companyName = props.companyName;
        this.companyAddress = props.companyAddress;
        this.companyLogoUrl = props.companyLogoUrl;
        this.signatoryName = props.signatoryName;
        this.signatoryDesignation = props.signatoryDesignation;
        this.candidateName = props.candidateName;
        this.candidateEmail = props.candidateEmail;
        this.workArrangement = props.workArrangement;
        this.location = props.location;
        this.jobType = props.jobType;
        this.benefits = props.benefits;
        this.offeredSalary = props.offeredSalary;
        this.salaryCurrency = props.salaryCurrency;
        this.salaryFrequency = props.salaryFrequency;
        this.proposedStartDate = props.proposedStartDate;
        this.offerExpirationDate = props.offerExpirationDate;
        this.probationPeriodMonths = props.probationPeriodMonths;
        this.noticePeriodDays = props.noticePeriodDays;
        this.reportingManager = props.reportingManager;
        this.documentsRequired = props.documentsRequired;
        this.additionalTerms = props.additionalTerms;
        this.status = props.status;
        this.createdAt = props.createdAt;
        this.acceptedAt = props.acceptedAt;
        this.declinedAt = props.declinedAt;
    }

    static create(
        props: Omit<OfferLetterProps, 'id' | 'createdAt' | 'status' | 'version'> & {
            version?: number;
        }
    ): Omit<OfferLetterProps, 'id'> {
        const now = new Date();
        return {
            ...props,
            version: props.version || 1,
            status: 'pending',
            createdAt: now,
        };
    }
}
