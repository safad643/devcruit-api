import { JobType, WorkArrangement, ExperienceLevel, Compensation, JobStatus, JobProps } from '../../domain/entities/Job';

// Input compensation type matching the API schema
// - Hidden: empty object {}
// - Range: { min, max, currency }
export type CreateJobCompensationInput = 
  | {}
  | { min: number; max: number; currency: string };

export interface CreateJobInput {
  companyId: string;
  title: string;
  description: string;
  category: string;
  requiredTech: string[];
  requiredSkills: string[];
  interviewRounds: string[];
  experienceLevel: ExperienceLevel;
  minYears: number;
  niceTech: string[];
  niceSkills: string[];
  jobType: JobType;
  workArrangement: WorkArrangement;
  location?: string;
  relocation: boolean;
  compensation: CreateJobCompensationInput;
  benefits?: string;
  validUntil: string; // ISO date string
  autoShortlist: boolean;
  status: 'draft' | 'open';
}

export interface CreateJobOutput {
  id: string;
  companyId: string;
  title: string;
  status: JobStatus;
  message: string;
}

// List Jobs Input/Output
export interface ListJobsInput {
  page: number;
  limit: number;
  search?: string; // Search by title
  status?: JobStatus | 'all';
  sortBy?: 'createdAt' | 'validUntil';
  sortOrder?: 'asc' | 'desc';
}

export interface JobListItem {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: string;
  requiredTech: string[];
  requiredSkills: string[];
  interviewRounds: string[];
  experienceLevel: ExperienceLevel;
  minYears: number;
  niceTech: string[];
  niceSkills: string[];
  jobType: JobType;
  workArrangement: WorkArrangement;
  location?: string;
  relocation: boolean;
  compensation: Compensation;
  benefits?: string;
  validUntil: Date;
  autoShortlist: boolean;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  applicationCount: number;
}

// Lightweight DTO for job list view (only fields used in list)
export interface JobListSummary {
  id: string;
  title: string;
  category: string;
  jobType: JobType;
  workArrangement: WorkArrangement;
  experienceLevel: ExperienceLevel;
  status: JobStatus;
  createdAt: Date;
  validUntil: Date;
  applicationCount: number;
}

export interface ListJobsOutput {
  jobs: JobListSummary[];
  total: number;
  page: number;
  limit: number;
}

// Public Job Search (read-only, safe fields)
export interface PublicListJobsInput {
  page: number;
  limit: number;
  query?: string;
  company?: string;
  location?: string;
  jobType?: JobType;
  workArrangement?: WorkArrangement;
  experienceLevel?: ExperienceLevel;
  sortBy?: 'createdAt' | 'validUntil';
  sortOrder?: 'asc' | 'desc';
}

export interface PublicCompanySummary {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface PublicJobSummary {
  id: string;
  title: string;
  company: PublicCompanySummary;
  category: string;
  experienceLevel: ExperienceLevel;
  jobType: JobType;
  workArrangement: WorkArrangement;
  location?: string;
  compensation: Compensation;
  createdAt: Date;
  validUntil: Date;
  tags: string[]; // derived from skills/tech for display
}

export interface PublicListJobsOutput {
  items: PublicJobSummary[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface PublicJobDetail extends Omit<PublicJobSummary, 'tags'> {
  description: string;
  benefits?: string;
  requiredTech: string[];
  requiredSkills: string[];
  niceTech: string[];
  niceSkills: string[];
  minYears: number;
  interviewRounds: string[];
  relocation: boolean;
  autoShortlist: boolean;
}

export interface OpenJobInput {
  jobId: string;
  companyId: string;
}

export interface OpenJobOutput {
  message: string;
}

export interface CloseJobInput {
  jobId: string;
  companyId: string;
}

export interface CloseJobOutput {
  message: string;
}

export interface DeleteJobInput {
  jobId: string;
  companyId: string;
}

export interface DeleteJobOutput {
  message: string;
}

export interface GetJobInput {
  jobId: string;
  companyId: string;
}

export interface UpdateJobInput {
  jobId: string;
  companyId: string;
  updates: Partial<Omit<JobProps, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'status'>>;
}

export interface UpdateJobOutput {
  id: string;
  message: string;
}

