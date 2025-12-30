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

export interface RecentApplicationItem {
  id: string;
  developerName: string;
  jobTitle: string;
  status: string;
  appliedAt: Date;
}

export interface UpcomingInterviewItem {
  applicationId: string;
  roundName: string;
  candidateName: string;
  jobTitle: string;
  scheduledAt: Date;
}

export interface ApplicationTrendItem {
  date: string;
  count: number;
}

export interface IApplicationRepository extends IGenericRepository<Application, CreateApplicationProps, UpdateApplicationProps> {
  findByJobId(jobId: string): Promise<Application[]>;
  findByDeveloperId(developerId: string): Promise<Application[]>;
  findByJobIdAndDeveloperId(jobId: string, developerId: string): Promise<Application | null>;
  listWithFilters(filters: ApplicationListFilters): Promise<ApplicationListResult>;
  getMetricsByJobId(jobId: string, companyId: string): Promise<ApplicationMetrics>;
  findByInterviewerId(interviewerId: string): Promise<Application[]>;
  hasConflictingInterview(
    interviewerId: string,
    scheduledAt: Date,
    excludeApplicationId?: string,
    excludeRoundName?: string
  ): Promise<boolean>;
  // Dashboard aggregation methods
  getStatusCountsByCompany(companyId: string): Promise<Record<string, number>>;
  getRecentWithDetails(companyId: string, limit: number): Promise<RecentApplicationItem[]>;
  getUpcomingInterviews(companyId: string, limit: number): Promise<UpcomingInterviewItem[]>;
  getApplicationTrend(companyId: string, days: number): Promise<ApplicationTrendItem[]>;
}
