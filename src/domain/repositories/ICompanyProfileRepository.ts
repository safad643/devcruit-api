import { CompanyProfile, CompanyProfileProps } from '../entities/CompanyProfile';

export interface ICompanyProfileRepository {
  findByUserId(userId: string): Promise<CompanyProfile | null>;
  findById(id: string): Promise<CompanyProfile | null>;
  create(profile: Omit<CompanyProfileProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyProfile>;
  update(userId: string, updates: Partial<CompanyProfileProps>): Promise<CompanyProfile>;
  delete(userId: string): Promise<void>;
}

