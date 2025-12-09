import { DeveloperProfile, DeveloperProfileProps } from '../entities/DeveloperProfile';
import { IGenericRepository } from './IGenericRepository';

export interface DeveloperProfileSearchFilters {
  techs?: string[];
  seniorityLevel?: string;
  willingToRelocate?: boolean;
  workArrangement?: string[];
  jobTypePreferences?: string[];
  employmentStatus?: string;
  minYearsExperience?: number;
  maxYearsExperience?: number;
  minDesiredSalary?: number;
  maxDesiredSalary?: number;
}

export interface DeveloperListFilters {
  page: number;
  limit: number;
  search?: string;
  isBlocked?: boolean;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface DeveloperListResult {
  developers: Array<{
    developerProfile: DeveloperProfile;
    userEmail: string;
    isBlocked: boolean;
  }>;
  total: number;
}

export type CreateDeveloperProfileProps = Omit<DeveloperProfileProps, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDeveloperProfileProps = Partial<DeveloperProfileProps>;

export interface IDeveloperProfileRepository extends IGenericRepository<DeveloperProfile, CreateDeveloperProfileProps, UpdateDeveloperProfileProps> {
  findByUserId(userId: string): Promise<DeveloperProfile | null>;
  search(filters: DeveloperProfileSearchFilters): Promise<DeveloperProfile[]>;
  listWithFilters(filters: DeveloperListFilters): Promise<DeveloperListResult>;
}
