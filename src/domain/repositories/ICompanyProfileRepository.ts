import { CompanyProfile, CompanyProfileProps, CompanyProfileStatus, DocumentReuploadRequest } from '../entities/CompanyProfile';

export interface CompanyListFilters {
  page: number;
  limit: number;
  search?: string;
  searchField?: 'companyName' | 'fullName' | 'phoneNumber' | 'businessRegistrationNumber' | 'companyWebsite';
  status?: CompanyProfileStatus;
  companySize?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  isBlocked?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'companyName';
  sortOrder?: 'asc' | 'desc';
}

export interface CompanyListResult {
  companies: Array<{
    companyProfile: CompanyProfile;
    userEmail: string;
    isBlocked: boolean;
  }>;
  total: number;
}

export interface ICompanyProfileRepository {
  findByUserId(userId: string): Promise<CompanyProfile | null>;
  findById(id: string): Promise<CompanyProfile | null>;
  create(
    profile: Omit<CompanyProfileProps, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'planHistory' | 'documentReuploadRequests'>
  ): Promise<CompanyProfile>;
  update(userId: string, updates: Partial<CompanyProfileProps>): Promise<CompanyProfile>;
  delete(userId: string): Promise<void>;
  listWithFilters(filters: CompanyListFilters): Promise<CompanyListResult>;
  approveCompany(companyId: string): Promise<CompanyProfile>;
  rejectCompany(companyId: string, documentReuploadRequest: DocumentReuploadRequest): Promise<CompanyProfile>;
}

