import { InterviewRound } from '../../../../domain/entities/Application';

export interface InterviewForInterviewer {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  developerId: string;
  developerName?: string;
  developerEmail?: string;
  companyId: string;
  companyName?: string;
  roundName: string;
  scheduledAt?: Date;
  status: string;
  result?: string;
  feedback?: string;
  videoCallId?: string;
  videoCallStatus?: string;
}

export interface GetInterviewsForInterviewerOutput {
  interviews: InterviewForInterviewer[];
  total: number;
}

export interface IGetInterviewsForInterviewerUseCase {
  execute(interviewerId: string): Promise<GetInterviewsForInterviewerOutput>;
}

