import { ApplicationStatus, ShortlistMethod, InterviewRound, InterviewRoundStatus, InterviewRoundResult, StatusNotes } from '../../domain/entities/Application';

// Enriched InterviewRound with resolved interviewer names and roles
export interface EnrichedInterviewRound extends InterviewRound {
  interviewerNames: string[];
  interviewerRoles: string[];
}

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
  developerUserId?: string;
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
  developerTechs?: string[]; // Top tech skills for quick scan
  developerYearsExperience?: number;
  aiMatchScore?: number;
  aiMatchReason?: string;
}

export interface ListApplicationsForCompanyOutput {
  applications: ApplicationListItem[];
  total: number;
  page: number;
  limit: number;
}

// List Applications for Developer
export interface ListApplicationsForDeveloperInput {
  // Optional: filter by specific job for this developer
  jobId?: string;
  status?: ApplicationStatus;
  page: number;
  limit: number;
  sortBy?: 'appliedAt' | 'lastUpdatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface DeveloperApplicationListItem {
  id: string;
  status: ApplicationStatus;
  appliedAt: Date;
  hasScheduledInterview: boolean;
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

// Get Developer Application Details (for developer viewing their own application)
export interface DeveloperApplicationDetailsOutput {
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
  job?: {
    id: string;
    title: string;
  };
  company?: {
    id: string;
    companyName: string;
  };
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
  interviewRounds: EnrichedInterviewRound[];
  aiMatchScore?: number;
  aiMatchReason?: string;
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
    // Full profile fields (exposed when candidate applies to company's job)
    profilePhotoUrl?: string;
    bio?: string;
    skills?: string[];
    techs?: string[];
    workHistory?: {
      companyName: string;
      positionTitle: string;
      startDate: string;
      endDate: string | null;
      description: string;
      technologiesUsed: string[];
      achievements: string[];
    }[];
    education?: {
      degreeType: string;
      institution: string;
      fieldOfStudy: string;
      graduationYear: number | null;
      certificateUrl?: string;
    }[];
    projects?: {
      name: string;
      description: string;
      techStack: string[];
      repositoryUrl?: string;
      liveDemoUrl?: string;
      roleInProject: string;
    }[];
    githubUrl?: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
    resumeUrl?: string;
    employmentStatus?: string;
    jobTypePreferences?: string[];
    workArrangement?: string[];
    yearsExperience?: number;
    seniorityLevel?: string;
    willingToRelocate?: boolean;
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

// Extend Offer (Company)
export interface ExtendOfferInput {
  applicationId: string;
  companyId: string;
  note?: string;
}

export interface ExtendOfferOutput {
  id: string;
  status: ApplicationStatus;
  message: string;
}

// Accept Offer (Developer)
export interface AcceptOfferInput {
  applicationId: string;
  developerId: string;
}

export interface AcceptOfferOutput {
  id: string;
  status: ApplicationStatus;
  message: string;
}

// Decline Offer (Developer)
export interface DeclineOfferInput {
  applicationId: string;
  developerId: string;
  note?: string;
}

export interface DeclineOfferOutput {
  id: string;
  status: ApplicationStatus;
  message: string;
}

