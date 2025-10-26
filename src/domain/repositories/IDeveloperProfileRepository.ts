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

export interface IDeveloperProfileRepository {
  findByUserId(userId: string): Promise<DeveloperProfile | null>;
  findById(id: string): Promise<DeveloperProfile | null>;
  create(profile: Omit<DeveloperProfileProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeveloperProfile>;
  update(userId: string, updates: Partial<DeveloperProfileProps>): Promise<DeveloperProfile>;
  delete(userId: string): Promise<void>;
  search(filters: DeveloperProfileSearchFilters): Promise<DeveloperProfile[]>;
}

