import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository, IJobRepository, IDeveloperProfileRepository, ICompanyProfileRepository, IUserRepository } from '../../../domain/repositories';
import { IGetInterviewsForInterviewerUseCase, GetInterviewsForInterviewerOutput, InterviewForInterviewer } from './interfaces';

@injectable()
export class GetInterviewsForInterviewerUseCase implements IGetInterviewsForInterviewerUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.DeveloperProfileRepository) private developerProfileRepository: IDeveloperProfileRepository,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(interviewerId: string): Promise<GetInterviewsForInterviewerOutput> {
    // 1. Get all applications where interviewer is assigned
    const applications = await this.applicationRepository.findByInterviewerId(interviewerId);

    // 2. Build interview list
    const interviews: InterviewForInterviewer[] = [];

    for (const application of applications) {
      // Get job info
      const job = await this.jobRepository.findById(application.jobId);
      if (!job) continue;

      // Get developer info
      const developerProfile = await this.developerProfileRepository.findById(application.developerId);
      let developerName: string | undefined;
      let developerEmail: string | undefined;
      if (developerProfile) {
        const developerUser = await this.userRepository.findById(developerProfile.userId);
        developerName = developerUser?.name;
        developerEmail = developerUser?.email;
      }

      // Get company info
      const companyProfile = await this.companyProfileRepository.findByUserId(application.companyId);
      const companyName = companyProfile?.companyName;

      // Find all rounds where this interviewer is assigned
      for (const round of application.interviewRounds) {
        if (round.interviewerIds.includes(interviewerId)) {
          interviews.push({
            applicationId: application.id,
            jobId: application.jobId,
            jobTitle: job.title,
            developerId: application.developerId,
            developerName,
            developerEmail,
            companyId: application.companyId,
            companyName,
            roundName: round.roundName,
            scheduledAt: round.scheduledAt,
            status: round.status,
            result: round.result,
            feedback: round.feedback,
            videoCallId: round.videoCallId,
            videoCallStatus: round.videoCallStatus,
          });
        }
      }
    }

    // Sort by scheduled date (upcoming first)
    interviews.sort((a, b) => {
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return a.scheduledAt.getTime() - b.scheduledAt.getTime();
    });

    return {
      interviews,
      total: interviews.length,
    };
  }
}

