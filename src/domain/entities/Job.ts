export type JobStatus = 'draft' | 'open' | 'closed';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance';
export type WorkArrangement = 'remote' | 'hybrid' | 'on-site';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead';

export interface Compensation {
  mode: 'hidden' | 'range';
  min?: number;
  max?: number;
  currency?: string;
}

export interface JobProps {
  id: string;
  companyId: string; // Reference to the User (company)
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
  location?: string; // Required if workArrangement is 'on-site' or 'hybrid'
  relocation: boolean;
  compensation: Compensation;
  benefits?: string;
  validUntil: Date;
  autoShortlist: boolean;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Job {
  public readonly id: string;
  public readonly companyId: string;
  public readonly title: string;
  public readonly description: string;
  public readonly category: string;
  public readonly requiredTech: string[];
  public readonly requiredSkills: string[];
  public readonly interviewRounds: string[];
  public readonly experienceLevel: ExperienceLevel;
  public readonly minYears: number;
  public readonly niceTech: string[];
  public readonly niceSkills: string[];
  public readonly jobType: JobType;
  public readonly workArrangement: WorkArrangement;
  public readonly location?: string;
  public readonly relocation: boolean;
  public readonly compensation: Compensation;
  public readonly benefits?: string;
  public readonly validUntil: Date;
  public readonly autoShortlist: boolean;
  public readonly status: JobStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: JobProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.title = props.title;
    this.description = props.description;
    this.category = props.category;
    this.requiredTech = props.requiredTech;
    this.requiredSkills = props.requiredSkills;
    this.interviewRounds = props.interviewRounds;
    this.experienceLevel = props.experienceLevel;
    this.minYears = props.minYears;
    this.niceTech = props.niceTech;
    this.niceSkills = props.niceSkills;
    this.jobType = props.jobType;
    this.workArrangement = props.workArrangement;
    this.location = props.location;
    this.relocation = props.relocation;
    this.compensation = props.compensation;
    this.benefits = props.benefits;
    this.validUntil = props.validUntil;
    this.autoShortlist = props.autoShortlist;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<JobProps, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Omit<JobProps, 'id'> {
    const now = new Date();
    return {
      ...props,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
  }
}

