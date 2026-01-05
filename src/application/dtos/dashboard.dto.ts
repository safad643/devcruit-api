// src/application/dtos/dashboard.dto.ts

export interface JobStats {
    open: number;
    closed: number;
    draft: number;
    total: number;
}

export interface ApplicationStatusCounts {
    applied: number;
    shortlisted: number;
    interviewing: number;
    interview_completed: number;
    offer_extended: number;
    offer_accepted: number;
    offer_declined: number;
    rejected: number;
    withdrawn: number;
}

export interface ApplicationStats {
    total: number;
    byStatus: ApplicationStatusCounts;
}

export interface TeamStats {
    total: number;
    hr: number;
    interviewers: number;
    active: number;
    invited: number;
}

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
    date: string; // YYYY-MM-DD
    count: number;
}

export interface CompanyDashboardOutput {
    jobs: JobStats;
    applications: ApplicationStats;
    team: TeamStats;
    recentApplications: RecentApplicationItem[];
    upcomingInterviews: UpcomingInterviewItem[];
    applicationTrend: ApplicationTrendItem[];
}

// Admin Dashboard Types
export interface UserStats {
    total: number;
    developers: number;
    companies: number;
    blocked: number;
}

export interface CompanyStatusCounts {
    pending: number;
    approved: number;
    rejected: number;
    resubmitted: number;
}

export interface PlatformStats {
    totalJobs: number;
    openJobs: number;
    totalApplications: number;
    activePlans: number;
    jobFields: number;
}

export interface SignupTrendItem {
    date: string;
    developers: number;
    companies: number;
}

export interface RevenueTrendItem {
    date: string;
    amount: number;
}

export interface PendingCompanyItem {
    id: string;
    companyName: string;
    email: string;
    submittedAt: Date;
}

export interface AdminDashboardOutput {
    users: UserStats;
    companyStatus: CompanyStatusCounts;
    platform: PlatformStats;
    signupTrend: SignupTrendItem[];
    revenueTrend: RevenueTrendItem[];
    pendingCompanies: PendingCompanyItem[];
    totalRevenue: number;
}

// Developer Dashboard Types
export interface DeveloperUpcomingInterviewItem {
    applicationId: string;
    roundName: string;
    jobTitle: string;
    companyName: string;
    scheduledAt: Date;
}

export interface DeveloperRecentApplicationItem {
    id: string;
    jobTitle: string;
    companyName: string;
    status: string;
    appliedAt: Date;
}

export interface DeveloperDashboardOutput {
    stats: {
        total: number;
        active: number;
        offers: number;
        rejected: number;
        pendingOffers: number;
    };
    byStatus: ApplicationStatusCounts;
    upcomingInterviews: DeveloperUpcomingInterviewItem[];
    recentApplications: DeveloperRecentApplicationItem[];
}

