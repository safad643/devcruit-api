import { Job, JobProps, JobStatus } from '../entities/Job';

export interface JobListFilters {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  status?: JobStatus;
  sortBy?: 'createdAt' | 'validUntil';
  sortOrder?: 'asc' | 'desc';
}

export interface JobListResult {
  jobs: Job[];
  total: number;
}

// Public listing filters (no auth, only open jobs)
export interface PublicJobListFilters {
  page: number;
  limit: number;
  query?: string;
  company?: string;
  location?: string;
  jobType?: 'full-time' | 'part-time' | 'contract' | 'freelance';
  workArrangement?: 'remote' | 'hybrid' | 'on-site';
  experienceLevel?: 'junior' | 'mid' | 'senior' | 'lead';
  sortBy?: 'createdAt' | 'validUntil';
  sortOrder?: 'asc' | 'desc';
}

export interface IJobRepository {
  create(job: Omit<JobProps, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: JobStatus }): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  findByCompanyId(companyId: string): Promise<Job[]>;
  update(id: string, updates: Partial<JobProps>): Promise<Job>;
  delete(id: string): Promise<void>;
  listWithFilters(filters: JobListFilters): Promise<JobListResult>;
  listPublicWithFilters(filters: PublicJobListFilters): Promise<JobListResult>;
}

