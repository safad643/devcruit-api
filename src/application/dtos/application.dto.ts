import { ApplicationStatus, ShortlistMethod, InterviewRound, InterviewRoundStatus, InterviewRoundResult, StatusNotes } from '../../domain/entities/Application';

// Create Application (Apply to Job)
export interface CreateApplicationInput {
  jobId: string;
  resumeUrl?: string; // Optional resume URL for this specific application
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
  statusNotes?: StatusNotes;
  appliedAt: Date;
  lastUpdatedAt: Date;
  rejectedAt?: Date;
  rejectedAtStage?: string;
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
  statusNotes?: StatusNotes;
  appliedAt: Date;
  lastUpdatedAt: Date;
  rejectedAt?: Date;
  rejectedAtStage?: string;
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
  statusNotes?: StatusNotes;
  appliedAt: Date;
  lastUpdatedAt: Date;
  rejectedAt?: Date;
  rejectedAtStage?: string;
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

// Update Application Status (Shortlist Only)
export interface UpdateApplicationStatusInput {
  applicationId: string;
  companyId: string;
  note?: string;
}

export interface UpdateApplicationStatusOutput {
  id: string;
  status: ApplicationStatus;
  message: string;
}

// Reject Application
export interface RejectApplicationInput {
  applicationId: string;
  companyId: string;
  note?: string;
}

export interface RejectApplicationOutput {
  id: string;
  status: ApplicationStatus;
  message: string;
}

