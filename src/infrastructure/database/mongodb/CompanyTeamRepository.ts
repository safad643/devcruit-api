import { Collection, ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import {
  CompanyTeamMember,
  ICompanyTeamRepository,
  InviteCompanyTeamMemberInput
} from '../../../domain/repositories';
import { getMongoDb } from './client';
import { InternalError } from '../../../domain/errors';
import { HRPermissions, HRProfile } from '../../../domain/entities/HRProfile';
import { InterviewerProfile } from '../../../domain/entities/InterviewerProfile';
import { CompanyTeamMemberStatus } from '../../../domain/types';

interface CompanyTeamMemberDocument {
  _id: ObjectId;
  companyId: string;
  userId: string | null;
  email: string;
  fullName?: string;
  role: 'hr' | 'interviewer';
  jobTitle?: string;
  phoneNumber?: string;
  permissions?: HRPermissions;
  focusAreas?: string[];
  availability?: {
    timezone?: string;
    calendarLink?: string;
  };
  status: CompanyTeamMemberStatus;
  invitedBy: string;
  invitedAt: Date;
  activatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@injectable()
export class CompanyTeamRepository implements ICompanyTeamRepository {
  private collection: Collection<CompanyTeamMemberDocument>;

  constructor() {
    this.collection = getMongoDb().collection<CompanyTeamMemberDocument>('company_team_members');
  }

  async inviteMember(input: InviteCompanyTeamMemberInput): Promise<CompanyTeamMember> {
    try {
      const now = new Date();
      const permissions =
        input.role === 'hr'
          ? input.hrPermissions ?? {
              manageApplications: true,
              scheduleInterviews: true,
              inviteMembers: false,
            }
          : undefined;

      const focusAreas = input.role === 'interviewer'
        ? input.interviewerFocusAreas ?? []
        : undefined;

      const availability = input.role === 'interviewer'
        ? input.interviewerAvailability
        : undefined;

      const status: CompanyTeamMemberStatus = input.userId ? 'active' : 'invited';

      const doc: Omit<CompanyTeamMemberDocument, '_id'> = {
        companyId: input.companyId,
        userId: input.userId ?? null,
        email: input.email.toLowerCase(),
        fullName: input.fullName,
        role: input.role,
        jobTitle: input.jobTitle,
        phoneNumber: input.phoneNumber,
        permissions,
        focusAreas,
        availability,
        status,
        invitedBy: input.invitedBy,
        invitedAt: now,
        activatedAt: input.userId ? now : undefined,
        createdAt: now,
        updatedAt: now,
      };

      const result = await this.collection.insertOne(doc);
      return this.mapToEntity({ ...doc, _id: result.insertedId });
    } catch (error) {
      throw new InternalError('Failed to invite team member', error as Error);
    }
  }

  async listMembers(companyId: string): Promise<CompanyTeamMember[]> {
    try {
      const docs = await this.collection
        .find({ companyId })
        .sort({ createdAt: -1 })
        .toArray();
      return docs.map((doc) => this.mapToEntity(doc));
    } catch (error) {
      throw new InternalError('Failed to list company team members', error as Error);
    }
  }

  async findByEmail(companyId: string, email: string): Promise<CompanyTeamMember | null> {
    try {
      const doc = await this.collection.findOne({ companyId, email: email.toLowerCase() });
      return doc ? this.mapToEntity(doc) : null;
    } catch (error) {
      throw new InternalError('Failed to find team member by email', error as Error);
    }
  }

  async findByUserId(userId: string): Promise<CompanyTeamMember | null> {
    try {
      const doc = await this.collection.findOne({ userId });
      return doc ? this.mapToEntity(doc) : null;
    } catch (error) {
      throw new InternalError('Failed to find team member by user ID', error as Error);
    }
  }

  async updateStatus(teamMemberId: string, status: CompanyTeamMemberStatus): Promise<void> {
    try {
      if (!ObjectId.isValid(teamMemberId)) {
        throw new InternalError('Invalid team member ID');
      }

      await this.collection.updateOne(
        { _id: new ObjectId(teamMemberId) },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        }
      );
    } catch (error) {
      throw new InternalError('Failed to update team member status', error as Error);
    }
  }

  private mapToEntity(doc: CompanyTeamMemberDocument): CompanyTeamMember {
    if (doc.role === 'hr') {
      return new HRProfile({
        id: doc._id.toString(),
        userId: doc.userId,
        companyId: doc.companyId,
        email: doc.email,
        fullName: doc.fullName,
        jobTitle: doc.jobTitle,
        phoneNumber: doc.phoneNumber,
        permissions:
          doc.permissions ??
          {
            manageApplications: true,
            scheduleInterviews: true,
            inviteMembers: false,
          },
        status: doc.status,
        invitedBy: doc.invitedBy,
        invitedAt: doc.invitedAt,
        activatedAt: doc.activatedAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      });
    }

    return new InterviewerProfile({
      id: doc._id.toString(),
      userId: doc.userId,
      companyId: doc.companyId,
      email: doc.email,
      fullName: doc.fullName,
      focusAreas: doc.focusAreas ?? [],
      availability: doc.availability,
      status: doc.status,
      invitedBy: doc.invitedBy,
      invitedAt: doc.invitedAt,
      activatedAt: doc.activatedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

