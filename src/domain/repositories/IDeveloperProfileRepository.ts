import { DeveloperProfile, DeveloperProfileProps } from '../entities/DeveloperProfile';

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
  search?: string; // Search by user email
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

export interface IDeveloperProfileRepository {
  findByUserId(userId: string): Promise<DeveloperProfile | null>;
  findById(id: string): Promise<DeveloperProfile | null>;
  create(profile: Omit<DeveloperProfileProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeveloperProfile>;
  update(userId: string, updates: Partial<DeveloperProfileProps>): Promise<DeveloperProfile>;
  delete(userId: string): Promise<void>;
  search(filters: DeveloperProfileSearchFilters): Promise<DeveloperProfile[]>;
  listWithFilters(filters: DeveloperListFilters): Promise<DeveloperListResult>;
}

