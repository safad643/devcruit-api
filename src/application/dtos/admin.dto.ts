import { CompanyDocumentKey } from '../../domain/types';
import { PlanHistoryItem, DocumentReuploadRequest } from '../../domain/entities/CompanyProfile';

export interface BlockUserInput {
  userId: string;
}

export interface BlockUserOutput {
  userId: string;
  message: string;
}

export interface UnblockUserInput {
  userId: string;
}

export interface UnblockUserOutput {
  userId: string;
  message: string;
}

export interface ApproveCompanyInput {
  companyId: string;
}

export interface ApproveCompanyOutput {
  companyId: string;
  userId: string;
  message: string;
}

export interface RejectCompanyInput {
  companyId: string;
  documents: Array<{
    documentKey: CompanyDocumentKey;
    note?: string;
  }>;
}

export interface RejectCompanyOutput {
  companyId: string;
  userId: string;
  message: string;
}

// List Companies Input/Output
export interface ListCompaniesInput {
  page: number;
  limit: number;
  search?: string; // Search by email
  status?: 'pending' | 'approved' | 'rejected' | 'resubmitted' | 'all';
  hasActivePlan?: boolean;
  isBlocked?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'companyName';
  sortOrder?: 'asc' | 'desc';
}

export interface CompanyListItem {
  id: string;
  userId: string;
  companyName: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'resubmitted';
  hasActivePlan: boolean;
  isBlocked: boolean;
  createdAt: Date;
}

export interface ListCompaniesOutput {
  companies: CompanyListItem[];
  total: number;
  page: number;
  limit: number;
}

// List Developers Input/Output
export interface ListDevelopersInput {
  page: number;
  limit: number;
  search?: string; // Search by email
  isBlocked?: boolean;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface DeveloperListItem {
  id: string;
  userId: string;
  email: string;
  isBlocked: boolean;
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead';
  yearsExperience: number;
  employmentStatus: 'employed' | 'unemployed' | 'self-employed' | 'student' | 'looking';
  createdAt: Date;
}

export interface ListDevelopersOutput {
  developers: DeveloperListItem[];
  total: number;
  page: number;
  limit: number;
}

// Get Company Details (Admin) Input/Output
export interface GetCompanyDetailsOutput {
  id: string;
  userId: string;
  email: string;
  isBlocked: boolean;
  fullName: string;
  phoneNumber: string;
  companyName: string;
  companyWebsite: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  businessRegistrationNumber: string;
  businessAddress: string;
  businessRegistrationProofUrl: string;
  employmentVerificationUrl: string;
  logoUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'resubmitted';
  hasActivePlan: boolean;
  planHistory: PlanHistoryItem[];
  documentReuploadRequests: DocumentReuploadRequest[];
  createdAt: Date;
  updatedAt: Date;
}
