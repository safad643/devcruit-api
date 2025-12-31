import {
  IApplicationRepository,
  IJobRepository,
  IDeveloperProfileRepository,
  ICompanyProfileRepository,
  IUserRepository
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';
import { GetApplicationDetailsOutput } from '../../dtos/application.dto';
import { IGetApplicationDetailsUseCase } from './interfaces';

@injectable()
export class GetApplicationDetailsUseCase implements IGetApplicationDetailsUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository
  ) { }

  async execute(applicationId: string, companyId?: string, interviewerId?: string): Promise<GetApplicationDetailsOutput> {
    // Get application
    const application = await this._applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Verify access: either companyId matches OR interviewer is assigned to at least one round
    if (companyId) {
      // Company/HR access: verify the application belongs to the company
      if (application.companyId !== companyId) {
        throw new ForbiddenError('You do not have access to this application');
      }
    } else if (interviewerId) {
      // Interviewer access: verify they're assigned to at least one interview round
      const isAssigned = application.interviewRounds.some(round =>
        round.interviewerIds.includes(interviewerId)
      );
      if (!isAssigned) {
        throw new ForbiddenError('You are not assigned to any interview round for this application');
      }
    } else {
      throw new ForbiddenError('Access denied');
    }

    // Get job information
    const job = await this._jobRepository.findById(application.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Get developer profile
    const developerProfile = await this._developerProfileRepository.findById(application.developerId);

    // Get developer user information
    let developerName: string | undefined;
    let developerEmail: string | undefined;
    if (developerProfile) {
      const developerUser = await this._userRepository.findById(developerProfile.userId);
      developerName = developerUser?.name;
      developerEmail = developerUser?.email;
    }

    // Get company profile
    const companyProfile = await this._companyProfileRepository.findByUserId(application.companyId);

    // Resolve interviewer names and roles
    const allInterviewerIds = [...new Set(
      application.interviewRounds.flatMap(round => round.interviewerIds)
    )];
    const interviewerUsers = await Promise.all(
      allInterviewerIds.map(id => this._userRepository.findById(id))
    );
    const interviewerNameMap = new Map<string, string>();
    const interviewerRoleMap = new Map<string, string>();
    allInterviewerIds.forEach((id, index) => {
      const user = interviewerUsers[index]!;
      interviewerNameMap.set(id, user.name || user.email);
      interviewerRoleMap.set(id, user.role);
    });

    // Enrich interview rounds with interviewer names and roles
    const enrichedInterviewRounds = application.interviewRounds.map(round => ({
      ...round,
      interviewerNames: round.interviewerIds.map(id => interviewerNameMap.get(id)!),
      interviewerRoles: round.interviewerIds.map(id => interviewerRoleMap.get(id)!)
    }));

    return {
      id: application.id,
      jobId: application.jobId,
      developerId: application.developerId,
      companyId: application.companyId,
      status: application.status,
      shortlistMethod: application.shortlistMethod,
      statusNotes: application.statusNotes,
      appliedAt: application.appliedAt,
      lastUpdatedAt: application.lastUpdatedAt,
      rejectedAt: application.rejectedAt,
      rejectedAtStage: application.rejectedAtStage,
      interviewRounds: enrichedInterviewRounds,
      aiMatchScore: application.aiMatchScore,
      aiMatchReason: application.aiMatchReason,
      job: job ? {
        id: job.id,
        title: job.title,
        companyId: job.companyId,
        interviewRounds: job.interviewRounds,
      } : undefined,
      developer: developerProfile ? {
        id: developerProfile.id,
        userId: developerProfile.userId,
        name: developerName,
        email: developerEmail,
        // Full profile fields
        profilePhotoUrl: developerProfile.profilePhotoUrl,
        bio: developerProfile.bio,
        skills: developerProfile.skills,
        techs: developerProfile.techs,
        workHistory: developerProfile.workHistory,
        education: developerProfile.education,
        projects: developerProfile.projects,
        githubUrl: developerProfile.githubUrl,
        portfolioUrl: developerProfile.portfolioUrl,
        linkedinUrl: developerProfile.linkedinUrl,
        resumeUrl: developerProfile.resumeUrl,
        employmentStatus: developerProfile.employmentStatus,
        jobTypePreferences: developerProfile.jobTypePreferences,
        workArrangement: developerProfile.workArrangement,
        yearsExperience: developerProfile.yearsExperience,
        seniorityLevel: developerProfile.seniorityLevel,
        willingToRelocate: developerProfile.willingToRelocate,
      } : undefined,
      company: companyProfile ? {
        id: companyProfile.id,
        companyName: companyProfile.companyName,
      } : undefined,
    };
  }
}

