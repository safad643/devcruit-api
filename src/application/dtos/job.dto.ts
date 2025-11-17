import { JobType, WorkArrangement, ExperienceLevel, Compensation, JobStatus } from '../../domain/entities/Job';

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
  compensation: Compensation;
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

export interface ListJobsOutput {
  jobs: JobListItem[];
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

