import { InterviewRoundResult } from '../../../domain/entities/Application';

export interface UpdateInterviewResultInput {
  applicationId: string;
  roundName: string;
  result: InterviewRoundResult;
  feedback?: string;
}

export interface UpdateInterviewResultOutput {
  id: string;
  status: string;
  interviewRounds: Array<{
    roundName: string;
    status: string;
    result?: string;
    feedback?: string;
    completedAt?: Date;
  }>;
  message: string;
}

export interface IUpdateInterviewResultUseCase {
  execute(input: UpdateInterviewResultInput & { interviewerId: string }): Promise<UpdateInterviewResultOutput>;
}

