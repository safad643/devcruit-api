import { ApplicationStatus, ShortlistMethod, InterviewRound, InterviewRoundStatus, InterviewRoundResult } from '../../domain/entities/Application';

// Create Application (Apply to Job)
export interface CreateApplicationInput {
  jobId: string;
}

export interface CreateApplicationOutput {
  id: string;
  jobId: string;
  developerId: string;
  companyId: string;
  status: ApplicationStatus;
  shortlistMethod?: ShortlistMethod;
  message: string;
}

// List Applications for Company
export interface ListApplicationsForCompanyInput {
  jobId?: string; // Optional: filter by specific job
  status?: ApplicationStatus;
  page: number;
  limit: number;
  sortBy?: 'appliedAt' | 'lastUpdatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ApplicationListItem {
  id: string;
  jobId: string;
  developerId: string;
  companyId: string;
  status: ApplicationStatus;
  shortlistMethod?: ShortlistMethod;
  appliedAt: Date;
  lastUpdatedAt: Date;
  rejectedAt?: Date;
  rejectedAtStage?: string;
  rejectionReason?: string;
  interviewRounds: InterviewRound[];
  // Enriched fields for display
  jobTitle?: string;
  developerName?: string;
  developerEmail?: string;
}

export interface ListApplicationsForCompanyOutput {
  applications: ApplicationListItem[];
  total: number;
  page: number;
  limit: number;
}

// List Applications for Developer
export interface ListApplicationsForDeveloperInput {
  status?: ApplicationStatus;
  page: number;
  limit: number;
  sortBy?: 'appliedAt' | 'lastUpdatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface DeveloperApplicationListItem {
  id: string;
  jobId: string;
  companyId: string;
  status: ApplicationStatus;
  shortlistMethod?: ShortlistMethod;
  appliedAt: Date;
  lastUpdatedAt: Date;
  rejectedAt?: Date;
  rejectedAtStage?: string;
  rejectionReason?: string;
  interviewRounds: InterviewRound[];
  // Enriched fields for display
  jobTitle?: string;
  companyName?: string;
}

export interface ListApplicationsForDeveloperOutput {
  applications: DeveloperApplicationListItem[];
  total: number;
  page: number;
  limit: number;
}

// Get Application Details
export interface GetApplicationDetailsOutput {
  id: string;
  jobId: string;
  developerId: string;
  companyId: string;
  status: ApplicationStatus;
  shortlistMethod?: ShortlistMethod;
  appliedAt: Date;
  lastUpdatedAt: Date;
  rejectedAt?: Date;
  rejectedAtStage?: string;
  rejectionReason?: string;
  interviewRounds: InterviewRound[];
  // Enriched fields
  job?: {
    id: string;
    title: string;
    companyId: string;
    interviewRounds: string[]; // All interview rounds defined for the job
  };
  developer?: {
    id: string;
    userId: string;
    name?: string;
    email?: string;
  };
  company?: {
    id: string;
    companyName: string;
  };
}

// Withdraw Application
export interface WithdrawApplicationInput {
  applicationId: string;
}

export interface WithdrawApplicationOutput {
  id: string;
  status: ApplicationStatus;
  message: string;
}

// Application Metrics
export interface ApplicationMetricsOutput {
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

// Update Application Status
export interface UpdateApplicationStatusInput {
  applicationId: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  roundName?: string; // Optional: specific round name when status is 'interviewing'
}

export interface UpdateApplicationStatusOutput {
  id: string;
  status: ApplicationStatus;
  message: string;
}

