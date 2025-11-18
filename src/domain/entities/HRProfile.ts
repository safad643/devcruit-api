import { CompanyTeamMemberStatus } from '../types';

export interface HRPermissions {
  manageApplications: boolean;
  scheduleInterviews: boolean;
  inviteMembers: boolean;
}

export interface HRProfileProps {
  id: string;
  userId: string | null;
  companyId: string;
  email: string;
  fullName?: string;
  jobTitle?: string;
  phoneNumber?: string;
  permissions: HRPermissions;
  status: CompanyTeamMemberStatus;
  invitedBy: string;
  invitedAt: Date;
  activatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class HRProfile {
  public readonly id: string;
  public readonly userId: string | null;
  public readonly companyId: string;
  public readonly email: string;
  public readonly fullName?: string;
  public readonly jobTitle?: string;
  public readonly phoneNumber?: string;
  public readonly permissions: HRPermissions;
  public readonly status: CompanyTeamMemberStatus;
  public readonly invitedBy: string;
  public readonly invitedAt: Date;
  public readonly activatedAt?: Date;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: HRProfileProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.companyId = props.companyId;
    this.email = props.email;
    this.fullName = props.fullName;
    this.jobTitle = props.jobTitle;
    this.phoneNumber = props.phoneNumber;
    this.permissions = props.permissions;
    this.status = props.status;
    this.invitedBy = props.invitedBy;
    this.invitedAt = props.invitedAt;
    this.activatedAt = props.activatedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(input: Omit<HRProfileProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Omit<HRProfileProps, 'id'> {
    const now = new Date();
    return {
      ...input,
      status: 'invited',
      createdAt: now,
      updatedAt: now,
    };
  }
}

