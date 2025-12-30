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

export type RescheduleRequestStatus = 'pending' | 'approved' | 'rejected';

export interface RescheduleRequest {
  requestedBy: 'candidate' | 'company';
  requestedById: string;
  reason?: string;
  proposedScheduledAt?: Date;
  status: RescheduleRequestStatus;
  requestedAt: Date;
  respondedAt?: Date;
  responseNote?: string;
}

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
  rescheduleRequest?: RescheduleRequest;
  rescheduleHistory?: RescheduleRequest[];
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
  resumeUrl?: string;
  currentOfferLetterId?: string;
  aiMatchScore?: number;
  aiMatchReason?: string;
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
  public readonly aiMatchScore?: number;
  public readonly aiMatchReason?: string;

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
    this.aiMatchScore = props.aiMatchScore;
    this.aiMatchReason = props.aiMatchReason;
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

