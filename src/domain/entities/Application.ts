export type ApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'interviewing'
  | 'interview_completed'
  | 'rejected'
  | 'offer_extended'
  | 'offer_accepted'
  | 'offer_declined'
  | 'withdrawn';

export type ShortlistMethod = 'auto' | 'manual';

export type InterviewRoundStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export enum InterviewRoundResult {
  PASS = 'pass',
  FAIL = 'fail',
  ON_HOLD = 'on-hold'
}

export type VideoCallStatus = 'not-started' | 'in-progress' | 'ended';

export interface InterviewRound {
  roundName: string;
  status: InterviewRoundStatus;
  scheduledAt?: Date;
  completedAt?: Date;
  result?: InterviewRoundResult;
  feedback?: string;
  interviewerIds: string[];
  videoCallId?: string;
  videoCallStatus?: VideoCallStatus;
}

export interface StatusNotes {
  shortlisted?: string;
  rejected?: string;
  interviewing?: string;
  offer_extended?: string;
  offer_accepted?: string;
  offer_declined?: string;
  withdrawn?: string;
}

export interface ApplicationProps {
  id: string;
  jobId: string; // Reference to the Job
  developerId: string; // Reference to the DeveloperProfile (candidate)
  companyId: string; // Reference to the CompanyProfile (denormalized for faster queries)
  status: ApplicationStatus;
  shortlistMethod?: ShortlistMethod; // Set when status becomes 'shortlisted'
  statusNotes?: StatusNotes; // Notes for different status transitions
  appliedAt: Date;
  lastUpdatedAt: Date;
  rejectedAt?: Date;
  rejectedAtStage?: string; // Exact stage or round at which rejection happened
  interviewRounds: InterviewRound[];
  resumeUrl?: string; // Optional resume URL for this specific application
  currentOfferLetterId?: string; // Reference to the latest offer letter
}

export class Application {
  public readonly id: string;
  public readonly jobId: string;
  public readonly developerId: string;
  public readonly companyId: string;
  public readonly status: ApplicationStatus;
  public readonly shortlistMethod?: ShortlistMethod;
  public readonly statusNotes?: StatusNotes;
  public readonly appliedAt: Date;
  public readonly lastUpdatedAt: Date;
  public readonly rejectedAt?: Date;
  public readonly rejectedAtStage?: string;
  public readonly interviewRounds: InterviewRound[];
  public readonly resumeUrl?: string;
  public readonly currentOfferLetterId?: string;

  constructor(props: ApplicationProps) {
    this.id = props.id;
    this.jobId = props.jobId;
    this.developerId = props.developerId;
    this.companyId = props.companyId;
    this.status = props.status;
    this.shortlistMethod = props.shortlistMethod;
    this.statusNotes = props.statusNotes;
    this.appliedAt = props.appliedAt;
    this.lastUpdatedAt = props.lastUpdatedAt;
    this.rejectedAt = props.rejectedAt;
    this.rejectedAtStage = props.rejectedAtStage;
    this.interviewRounds = props.interviewRounds;
    this.resumeUrl = props.resumeUrl;
    this.currentOfferLetterId = props.currentOfferLetterId;
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

