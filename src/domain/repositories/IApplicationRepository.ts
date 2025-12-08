import { Application, ApplicationProps, InterviewRound } from '../entities/Application';
import { IGenericRepository } from './IGenericRepository';

export interface ApplicationListFilters {
  companyId?: string;
  developerId?: string;
  jobId?: string;
  status?: string;
  page: number;
  limit: number;
  sortBy?: 'appliedAt' | 'lastUpdatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ApplicationListResult {
  applications: Application[];
  total: number;
}

export interface ApplicationMetrics {
  total: number;
  applied: number;
  shortlisted: number;
  interviewing: number;
  rejected: number;
  offer_extended: number;
  offer_accepted: number;
  offer_declined: number;
  withdrawn: number;
}

export type CreateApplicationProps = Omit<ApplicationProps, 'id' | 'appliedAt' | 'lastUpdatedAt' | 'status' | 'interviewRounds'> & {
  status?: string;
  interviewRounds?: InterviewRound[];
};
export type UpdateApplicationProps = Partial<ApplicationProps>;

export interface IApplicationRepository extends IGenericRepository<Application, CreateApplicationProps, UpdateApplicationProps> {
  findByJobId(jobId: string): Promise<Application[]>;
  findByDeveloperId(developerId: string): Promise<Application[]>;
  findByJobIdAndDeveloperId(jobId: string, developerId: string): Promise<Application | null>;
  listWithFilters(filters: ApplicationListFilters): Promise<ApplicationListResult>;
  getMetricsByJobId(jobId: string, companyId: string): Promise<ApplicationMetrics>;
  findByInterviewerId(interviewerId: string): Promise<Application[]>;
  findConflictingInterviews(interviewerId: string, scheduledAt: Date): Promise<Application[]>;
}
