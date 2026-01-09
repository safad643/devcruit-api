import { Collection, ObjectId, Filter } from 'mongodb';
import { injectable } from 'inversify';
import {
  CompanyTeamMember,
  CompanyTeamMemberWithRole,
  ICompanyTeamRepository,
  InviteCompanyTeamMemberInput,
  ListMembersOptions,
  PaginatedTeamMembersResult,
  UpdateTeamMemberData
} from '../../../domain/repositories';
import { getMongoDb } from './client';
import { InternalError, BadRequestError } from '../../../domain/errors';
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
  private _collection: Collection<CompanyTeamMemberDocument>;

  constructor() {
    this._collection = getMongoDb().collection<CompanyTeamMemberDocument>('company_team_members');
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

      const result = await this._collection.insertOne(doc as CompanyTeamMemberDocument);
      const documentWithId: CompanyTeamMemberDocument = {
        ...doc,
        _id: result.insertedId,
      };
      return this._mapToEntity(documentWithId);
    } catch (error) {
      throw new InternalError('Failed to invite team member', error as Error);
    }
  }

  async listMembers(companyId: string, options?: ListMembersOptions): Promise<PaginatedTeamMembersResult> {
    try {
      const page = options?.page ?? 1;
      const limit = options?.limit ?? 10;
      const filter: Filter<CompanyTeamMemberDocument> = { companyId };

      // Apply search filter
      if (options?.search) {
        const searchRegex = new RegExp(options.search, 'i');
        filter.$or = [
          { email: { $regex: searchRegex } },
          { fullName: { $regex: searchRegex } }
        ];
      }

      const skip = (page - 1) * limit;

      const [docs, total] = await Promise.all([
        this._collection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        this._collection.countDocuments(filter)
      ]);

      return {
        data: docs.map((doc) => ({
          member: this._mapToEntity(doc),
          role: doc.role,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalError('Failed to list company team members', error as Error);
    }
  }

  async findByEmail(companyId: string, email: string): Promise<CompanyTeamMember | null> {
    try {
      const doc = await this._collection.findOne({ companyId, email: email.toLowerCase() });
      return doc ? this._mapToEntity(doc) : null;
    } catch (error) {
      throw new InternalError('Failed to find team member by email', error as Error);
    }
  }

  async findByUserId(userId: string): Promise<CompanyTeamMember | null> {
    try {
      const doc = await this._collection.findOne({ userId });
      return doc ? this._mapToEntity(doc) : null;
    } catch (error) {
      throw new InternalError('Failed to find team member by user ID', error as Error);
    }
  }

  async findById(teamMemberId: string): Promise<CompanyTeamMemberWithRole | null> {
    try {
      if (!ObjectId.isValid(teamMemberId)) {
        throw new BadRequestError('Invalid team member ID format');
      }

      const doc = await this._collection.findOne({ _id: new ObjectId(teamMemberId) });
      if (!doc) return null;

      return {
        member: this._mapToEntity(doc),
        role: doc.role,
      };
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new InternalError('Failed to find team member by ID', error as Error);
    }
  }

  async updateMember(teamMemberId: string, data: UpdateTeamMemberData): Promise<CompanyTeamMember> {
    try {
      if (!ObjectId.isValid(teamMemberId)) {
        throw new BadRequestError('Invalid team member ID format');
      }

      const updateFields: Record<string, any> = { updatedAt: new Date() };
      if (data.fullName !== undefined) updateFields.fullName = data.fullName;
      if (data.jobTitle !== undefined) updateFields.jobTitle = data.jobTitle;

      const result = await this._collection.findOneAndUpdate(
        { _id: new ObjectId(teamMemberId) },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new BadRequestError('Team member not found');
      }

      return this._mapToEntity(result);
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new InternalError('Failed to update team member', error as Error);
    }
  }

  async deleteMember(teamMemberId: string): Promise<void> {
    try {
      if (!ObjectId.isValid(teamMemberId)) {
        throw new BadRequestError('Invalid team member ID format');
      }

      const result = await this._collection.deleteOne({ _id: new ObjectId(teamMemberId) });
      if (result.deletedCount === 0) {
        throw new BadRequestError('Team member not found');
      }
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new InternalError('Failed to delete team member', error as Error);
    }
  }

  async updateStatus(teamMemberId: string, status: CompanyTeamMemberStatus): Promise<void> {
    try {
      if (!ObjectId.isValid(teamMemberId)) {
        throw new BadRequestError('Invalid team member ID format');
      }

      await this._collection.updateOne(
        { _id: new ObjectId(teamMemberId) },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        }
      );
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new InternalError('Failed to update team member status', error as Error);
    }
  }

  private _mapToEntity(doc: CompanyTeamMemberDocument): CompanyTeamMember {
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
      jobTitle: doc.jobTitle,
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

  async countActiveByCompany(companyId: string): Promise<number> {
    try {
      return await this._collection.countDocuments({
        companyId,
        status: { $in: ['active', 'invited'] },
      });
    } catch (error) {
      throw new InternalError('Failed to count active team members', error as Error);
    }
  }

  async getTeamStats(companyId: string): Promise<{ total: number; hr: number; interviewers: number; active: number; invited: number }> {
    try {
      const pipeline = [
        { $match: { companyId } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
            byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }]
          }
        }
      ];

      const results = await this._collection.aggregate(pipeline).toArray();
      const facetResult = results[0] || { total: [], byRole: [], byStatus: [] };

      const stats = { total: 0, hr: 0, interviewers: 0, active: 0, invited: 0 };

      stats.total = facetResult.total[0]?.count || 0;

      for (const r of facetResult.byRole) {
        if (r._id === 'hr') stats.hr = r.count;
        if (r._id === 'interviewer') stats.interviewers = r.count;
      }

      for (const s of facetResult.byStatus) {
        if (s._id === 'active') stats.active = s.count;
        if (s._id === 'invited') stats.invited = s.count;
      }

      return stats;
    } catch (error) {
      throw new InternalError('Failed to get team stats', error as Error);
    }
  }
}

