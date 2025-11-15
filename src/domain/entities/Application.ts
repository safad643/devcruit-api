export type ApplicationStatus = 
  | 'applied' 
  | 'shortlisted' 
  | 'interviewing' 
  | 'rejected' 
  | 'offer_extended' 
  | 'offer_accepted' 
  | 'offer_declined' 
  | 'withdrawn';

export type ShortlistMethod = 'auto' | 'manual';

export type InterviewRoundStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';
export type InterviewRoundResult = 'pass' | 'fail' | 'on-hold';

export interface InterviewRound {
  roundName: string;
  status: InterviewRoundStatus;
  scheduledAt?: Date;
  completedAt?: Date;
  result?: InterviewRoundResult;
  feedback?: string;
  interviewerIds: string[];
}

export interface ApplicationProps {
  id: string;
  jobId: string; // Reference to the Job
  developerId: string; // Reference to the DeveloperProfile (candidate)
  companyId: string; // Reference to the CompanyProfile (denormalized for faster queries)
  status: ApplicationStatus;
  shortlistMethod?: ShortlistMethod; // Set when status becomes 'shortlisted'
  appliedAt: Date;
  lastUpdatedAt: Date;
  rejectedAt?: Date;
  rejectedAtStage?: string; // Exact stage or round at which rejection happened
  rejectionReason?: string;
  interviewRounds: InterviewRound[];
}

export class Application {
  public readonly id: string;
  public readonly jobId: string;
  public readonly developerId: string;
  public readonly companyId: string;
  public readonly status: ApplicationStatus;
  public readonly shortlistMethod?: ShortlistMethod;
  public readonly appliedAt: Date;
  public readonly lastUpdatedAt: Date;
  public readonly rejectedAt?: Date;
  public readonly rejectedAtStage?: string;
  public readonly rejectionReason?: string;
  public readonly interviewRounds: InterviewRound[];

  constructor(props: ApplicationProps) {
    this.id = props.id;
    this.jobId = props.jobId;
    this.developerId = props.developerId;
    this.companyId = props.companyId;
    this.status = props.status;
    this.shortlistMethod = props.shortlistMethod;
    this.appliedAt = props.appliedAt;
    this.lastUpdatedAt = props.lastUpdatedAt;
    this.rejectedAt = props.rejectedAt;
    this.rejectedAtStage = props.rejectedAtStage;
    this.rejectionReason = props.rejectionReason;
    this.interviewRounds = props.interviewRounds;
  }

  static create(
    props: Omit<ApplicationProps, 'id' | 'appliedAt' | 'lastUpdatedAt' | 'status' | 'interviewRounds'> & {
      status?: ApplicationStatus;
      interviewRounds?: InterviewRound[];
    }
  ): Omit<ApplicationProps, 'id'> {
    const now = new Date();
    return {
      ...props,
      status: props.status || 'applied',
      interviewRounds: props.interviewRounds || [],
      appliedAt: now,
      lastUpdatedAt: now,
    };
  }
}

