export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';

export type PlanTier = 'Basic' | 'Standard' | 'Premium';

export interface PlanHistoryItem {
  plan: PlanTier;
  startDate: Date;
  endDate: Date | null;
}

export interface DocumentReuploadRequestDocumentItem {
  documentKey: string;
  note?: string;
}

export interface DocumentReuploadRequest {
  documents: DocumentReuploadRequestDocumentItem[];
  requestedAt: Date;
}

export type CompanyProfileStatus = 'pending' | 'approved' | 'rejected' | 'resubmitted' | 'paid';

export interface CompanyProfileProps {
  id: string;
  userId: string; // Reference to the User
  fullName: string;
  phoneNumber: string;
  companyName: string;
  companyWebsite: string;
  companySize: CompanySize;
  businessRegistrationNumber: string;
  businessAddress: string;
  businessRegistrationProofUrl: string;
  employmentVerificationUrl: string;
  // Profile verification status
  status: CompanyProfileStatus;
  // Historical subscription plan records
  planHistory: PlanHistoryItem[];
  // Admin re-upload requests for specific documents
  documentReuploadRequests: DocumentReuploadRequest[];
  createdAt: Date;
  updatedAt: Date;
}

export class CompanyProfile {
  public readonly id: string;
  public readonly userId: string;
  public readonly fullName: string;
  public readonly phoneNumber: string;
  public readonly companyName: string;
  public readonly companyWebsite: string;
  public readonly companySize: CompanySize;
  public readonly businessRegistrationNumber: string;
  public readonly businessAddress: string;
  public readonly businessRegistrationProofUrl: string;
  public readonly employmentVerificationUrl: string;
  public readonly status: CompanyProfileStatus;
  public readonly planHistory: PlanHistoryItem[];
  public readonly documentReuploadRequests: DocumentReuploadRequest[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: CompanyProfileProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.fullName = props.fullName;
    this.phoneNumber = props.phoneNumber;
    this.companyName = props.companyName;
    this.companyWebsite = props.companyWebsite;
    this.companySize = props.companySize;
    this.businessRegistrationNumber = props.businessRegistrationNumber;
    this.businessAddress = props.businessAddress;
    this.businessRegistrationProofUrl = props.businessRegistrationProofUrl;
    this.employmentVerificationUrl = props.employmentVerificationUrl;
    this.status = props.status;
    this.planHistory = props.planHistory;
    this.documentReuploadRequests = props.documentReuploadRequests;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<CompanyProfileProps, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'planHistory' | 'documentReuploadRequests'>
  ): Omit<CompanyProfileProps, 'id'> {
    const now = new Date();
    return {
      ...props,
      status: 'pending',
      planHistory: [],
      documentReuploadRequests: [],
      createdAt: now,
      updatedAt: now,
    };
  }
}

