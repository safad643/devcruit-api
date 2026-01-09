import { CompanyTeamMemberStatus } from '../types';

export interface InterviewerAvailability {
  timezone?: string;
  calendarLink?: string;
}

export interface InterviewerProfileProps {
  id: string;
  userId: string | null;
  companyId: string;
  email: string;
  fullName?: string;
  jobTitle?: string;
  focusAreas: string[];
  availability?: InterviewerAvailability;
  status: CompanyTeamMemberStatus;
  invitedBy: string;
  invitedAt: Date;
  activatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class InterviewerProfile {
  public readonly id: string;
  public readonly userId: string | null;
  public readonly companyId: string;
  public readonly email: string;
  public readonly fullName?: string;
  public readonly jobTitle?: string;
  public readonly focusAreas: string[];
  public readonly availability?: InterviewerAvailability;
  public readonly status: CompanyTeamMemberStatus;
  public readonly invitedBy: string;
  public readonly invitedAt: Date;
  public readonly activatedAt?: Date;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: InterviewerProfileProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.companyId = props.companyId;
    this.email = props.email;
    this.fullName = props.fullName;
    this.jobTitle = props.jobTitle;
    this.focusAreas = props.focusAreas;
    this.availability = props.availability;
    this.status = props.status;
    this.invitedBy = props.invitedBy;
    this.invitedAt = props.invitedAt;
    this.activatedAt = props.activatedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(input: Omit<InterviewerProfileProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Omit<InterviewerProfileProps, 'id'> {
    const now = new Date();
    return {
      ...input,
      status: 'invited',
      createdAt: now,
      updatedAt: now,
    };
  }
}

