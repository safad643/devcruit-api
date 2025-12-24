import { PlanLimits } from './Plan';
import { CompanyDocumentKey } from '../types';

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';

// Pure snapshot - no planId reference, stores complete plan details at purchase time
export interface PlanHistoryItem {
  planName: string;
  price: number;
  finalPrice: number;              // After discount
  durationMonths: number;
  limits: PlanLimits;
  startDate: Date;
  endDate: Date;
}

export interface DocumentReuploadRequestDocumentItem {
  documentKey: CompanyDocumentKey;
  note?: string;
}

export interface DocumentReuploadRequest {
  documents: DocumentReuploadRequestDocumentItem[];
  requestedAt: Date;
}

export type CompanyProfileStatus = 'pending' | 'approved' | 'rejected' | 'resubmitted';

export interface CompanyProfileProps {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  companyName: string;
  companyWebsite: string;
  companySize: CompanySize;
  businessRegistrationNumber: string;
  businessAddress: string;
  businessRegistrationProofUrl: string;
  employmentVerificationUrl: string;
  logoUrl?: string;
  status: CompanyProfileStatus;
  planHistory: PlanHistoryItem[];
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
  public readonly logoUrl?: string;
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
    this.logoUrl = props.logoUrl;
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

  // Domain methods
  approve(): Partial<CompanyProfileProps> {
    return { status: 'approved' };
  }

  reject(request: DocumentReuploadRequest): Partial<CompanyProfileProps> {
    return {
      status: 'rejected',
      documentReuploadRequests: [...this.documentReuploadRequests, request],
    };
  }

  resubmitDocuments(documents: Partial<Record<CompanyDocumentKey, string>>): Partial<CompanyProfileProps> {
    const updates: Partial<CompanyProfileProps> = { status: 'resubmitted' };
    if (documents.COMPANY_REGISTRATION_DOCUMENT) {
      updates.businessRegistrationProofUrl = documents.COMPANY_REGISTRATION_DOCUMENT;
    }
    if (documents.COMPANY_VERIFICATION_DOCUMENT) {
      updates.employmentVerificationUrl = documents.COMPANY_VERIFICATION_DOCUMENT;
    }
    return updates;
  }

  hasActivePlan(): boolean {
    const now = new Date();
    return this.planHistory.some(p => new Date(p.endDate) > now);
  }

  getCurrentPlan(): PlanHistoryItem | null {
    const now = new Date();
    return this.planHistory.find(p => new Date(p.endDate) > now) ?? null;
  }

  getPlanExpiryDate(): Date | null {
    const activePlan = this.getCurrentPlan();
    if (!activePlan) return null;
    return new Date(activePlan.endDate);
  }
}
