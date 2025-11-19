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
import { PlanHistoryItem } from '../../domain/entities/CompanyProfile';
import { DocumentReuploadRequest } from '../../domain/entities/CompanyProfile';
import { CompanyDocumentKey } from '../../domain/types'; 
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
  logoUrl?: string;
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
export interface GetCompanyProfileOutput {
  id: string;
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
  logoUrl?: string;
  status: CompanyProfileStatus;
  planHistory: PlanHistoryItem[];
  documentReuploadRequests: DocumentReuploadRequest[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateCompanyProfileInput {
  companyName?: string;
  companyWebsite?: string;
  businessAddress?: string;
  logoUrl?: string;
}

export interface UpdateCompanyProfileOutput {
  id: string;
  message: string;
}

export interface ResubmitDocumentsInput {
  userId: string;
  documents: Partial<Record<CompanyDocumentKey, string>>;
}

export interface ResubmitDocumentsOutput {
  id: string;
  userId: string;
  message: string;
}