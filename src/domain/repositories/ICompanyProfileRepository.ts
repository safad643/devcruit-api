import { CompanyProfile, CompanyProfileProps, CompanyProfileStatus } from '../entities/CompanyProfile';
import { IGenericRepository } from './IGenericRepository';

export interface CompanyListFilters {
  page: number;
  limit: number;
  search?: string;
  searchField?: 'companyName' | 'fullName' | 'phoneNumber' | 'businessRegistrationNumber' | 'companyWebsite' | 'email';
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

export type CreateCompanyProfileProps = Omit<CompanyProfileProps, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'planHistory' | 'documentReuploadRequests'>;
export type UpdateCompanyProfileProps = Partial<CompanyProfileProps>;

export interface ICompanyProfileRepository extends IGenericRepository<CompanyProfile, CreateCompanyProfileProps, UpdateCompanyProfileProps> {
  findByUserId(userId: string): Promise<CompanyProfile | null>;
  listWithFilters(filters: CompanyListFilters): Promise<CompanyListResult>;
}
