import { 
  WorkHistory, 
  Education, 
  Certification, 
  Project, 
  JobType, 
  WorkArrangement, 
  SeniorityLevel 
} from '../../domain/entities/DeveloperProfile';
import { CompanyProfileStatus } from '../../domain/entities/CompanyProfile';

export interface CreateDeveloperProfileInput {
  userId: string;
  profilePhotoUrl: string;
  bio: string;
  skills: string[];
  techs: string[];
  workHistory: WorkHistory[];
  employmentStatus: 'employed' | 'unemployed' | 'self-employed' | 'student' | 'looking';
  education: Education[];
  certifications: Certification[];
  githubUrl: string;
  portfolioUrl?: string;
  projects: Project[];
  linkedinUrl: string;
  desiredSalary?: number;
  jobTypePreferences: JobType[];
  workArrangement: WorkArrangement[];
  yearsExperience: number;
  seniorityLevel: SeniorityLevel;
  willingToRelocate: boolean;
  resumeUrl: string;
}

export interface CreateDeveloperProfileOutput {
  id: string;
  userId: string;
  message: string;
}

export interface UpdateDeveloperProfileInput {
  profilePhotoUrl?: string;
  bio?: string;
  skills?: string[];
  techs?: string[];
  workHistory?: WorkHistory[];
  employmentStatus?: 'employed' | 'unemployed' | 'self-employed' | 'student' | 'looking';
  education?: Education[];
  certifications?: Certification[];
  githubUrl?: string;
  portfolioUrl?: string;
  projects?: Project[];
  linkedinUrl?: string;
  desiredSalary?: number;
  jobTypePreferences?: JobType[];
  workArrangement?: WorkArrangement[];
  yearsExperience?: number;
  seniorityLevel?: SeniorityLevel;
  willingToRelocate?: boolean;
  resumeUrl?: string;
}

export interface UpdateDeveloperProfileOutput {
  id: string;
  message: string;
}

// Company Profile DTOs
export interface CreateCompanyProfileInput {
  userId: string;
  fullName: string;
  phoneNumber: string;
  companyName: string;
  companyWebsite: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  businessRegistrationNumber: string;
  businessAddress: string;
  businessRegistrationProofUrl: string;
  employmentVerificationUrl: string;
}

export interface CreateCompanyProfileOutput {
  id: string;
  userId: string;
  message: string;
}

export interface GetDeveloperProfileOutput {
  id: string;
  userId: string;
  profilePhotoUrl?: string;
  bio?: string;
  skills: string[];
  techs: string[];
  workHistory: WorkHistory[];
  employmentStatus: 'employed' | 'unemployed' | 'self-employed' | 'student' | 'looking';
  education: Education[];
  certifications: Certification[];
  githubUrl?: string;
  portfolioUrl?: string;
  projects: Project[];
  linkedinUrl?: string;
  desiredSalary?: number;
  jobTypePreferences: JobType[];
  workArrangement: WorkArrangement[];
  yearsExperience: number;
  seniorityLevel: SeniorityLevel;
  willingToRelocate: boolean;
  resumeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Company List DTOs
export interface AdminCompanyListItem {
  id: string;
  userId: string;
  companyName: string;
  fullName: string;
  phoneNumber: string;
  companyWebsite: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  businessRegistrationNumber: string;
  businessAddress: string;
  status: CompanyProfileStatus;
  userEmail: string;
  isBlocked: boolean;
  documentReuploadRequestsCount: number;
  planHistoryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAdminCompanyListInput {
  page: number;
  limit: number;
  search?: string;
  searchField?: 'companyName' | 'fullName' | 'phoneNumber' | 'businessRegistrationNumber' | 'companyWebsite';
  status?: CompanyProfileStatus;
  companySize?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  isBlocked?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'companyName';
  sortOrder?: 'asc' | 'desc';
}

export interface GetAdminCompanyListOutput {
  data: AdminCompanyListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

