// Work History Interface
export interface WorkHistory {
  companyName: string;
  positionTitle: string;
  startDate: string;  // ISO 8601 string
  endDate: string | null;
  description: string;
  technologiesUsed: string[];
  achievements: string[];
}

// Education Interface
export interface Education {
  degreeType: string; // e.g., "Bachelor's", "Master's", "PhD"
  institution: string;
  fieldOfStudy: string;
  graduationYear: number | null;
  certificateUrl?: string; // Optional URL to uploaded certificate document
}

// Certification Interface
export interface Certification {
  name: string;
  issuingOrganization: string;
  dateObtained: string;
}

// Project Interface
export interface Project {
  name: string;
  description: string;
  techStack: string[];
  repositoryUrl?: string;
  liveDemoUrl?: string;
  roleInProject: string;
}

// Job Type and Work Arrangement enums
export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance';
export type WorkArrangement = 'remote' | 'hybrid' | 'on-site';
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead';

export interface DeveloperProfileProps {
  id: string;
  userId: string; // Reference to the User
  profilePhotoUrl: string;
  bio: string;
  skills: string[]; // Soft skills
  techs: string[]; // Technical stacks and programming languages
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
  createdAt: Date;
  updatedAt: Date;
}

export class DeveloperProfile {
  public readonly id: string;
  public readonly userId: string;
  public readonly profilePhotoUrl: string;
  public readonly bio: string;
  public readonly skills: string[];
  public readonly techs: string[];
  public readonly workHistory: WorkHistory[];
  public readonly employmentStatus: 'employed' | 'unemployed' | 'self-employed' | 'student' | 'looking';
  public readonly education: Education[];
  public readonly certifications: Certification[];
  public readonly githubUrl: string;
  public readonly portfolioUrl?: string;
  public readonly projects: Project[];
  public readonly linkedinUrl: string;
  public readonly desiredSalary?: number;
  public readonly jobTypePreferences: JobType[];
  public readonly workArrangement: WorkArrangement[];
  public readonly yearsExperience: number;
  public readonly seniorityLevel: SeniorityLevel;
  public readonly willingToRelocate: boolean;
  public readonly resumeUrl: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: DeveloperProfileProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.profilePhotoUrl = props.profilePhotoUrl;
    this.bio = props.bio;
    this.skills = props.skills;
    this.techs = props.techs;
    this.workHistory = props.workHistory;
    this.employmentStatus = props.employmentStatus;
    this.education = props.education;
    this.certifications = props.certifications;
    this.githubUrl = props.githubUrl;
    this.portfolioUrl = props.portfolioUrl;
    this.projects = props.projects;
    this.linkedinUrl = props.linkedinUrl;
    this.desiredSalary = props.desiredSalary;
    this.jobTypePreferences = props.jobTypePreferences;
    this.workArrangement = props.workArrangement;
    this.yearsExperience = props.yearsExperience;
    this.seniorityLevel = props.seniorityLevel;
    this.willingToRelocate = props.willingToRelocate;
    this.resumeUrl = props.resumeUrl;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<DeveloperProfileProps, 'id' | 'createdAt' | 'updatedAt'>): Omit<DeveloperProfileProps, 'id'> {
    const now = new Date();
    return {
      ...props,
      createdAt: now,
      updatedAt: now,
    };
  }
}

