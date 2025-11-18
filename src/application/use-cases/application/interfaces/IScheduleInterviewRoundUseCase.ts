export interface ScheduleInterviewRoundInput {
  applicationId: string;
  roundName: string;
  interviewerIds: string[];
  scheduledAt: string; // ISO date string
}

export interface ScheduleInterviewRoundOutput {
  id: string;
  status: string;
  interviewRounds: Array<{
    roundName: string;
    status: string;
    scheduledAt?: Date;
    interviewerIds: string[];
  }>;
  message: string;
}

export interface IScheduleInterviewRoundUseCase {
  execute(input: ScheduleInterviewRoundInput & { companyId: string }): Promise<ScheduleInterviewRoundOutput>;
}

