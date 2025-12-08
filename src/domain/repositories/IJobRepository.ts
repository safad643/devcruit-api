import { Job, JobProps, JobStatus } from '../entities/Job';
import { IGenericRepository } from './IGenericRepository';

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

export type CreateJobProps = Omit<JobProps, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: JobStatus };
export type UpdateJobProps = Partial<JobProps>;

export interface IJobRepository extends IGenericRepository<Job, CreateJobProps, UpdateJobProps> {
  findByCompanyId(companyId: string): Promise<Job[]>;
  listWithFilters(filters: JobListFilters): Promise<JobListResult>;
  listPublicWithFilters(filters: PublicJobListFilters): Promise<JobListResult>;
}
