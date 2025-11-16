import { JobProps } from '../../../../domain/entities/Job';

export interface IUpdateJobUseCase {
  execute(input: {
    jobId: string;
    companyId: string;
    updates: Partial<Omit<JobProps, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'status'>>;
  }): Promise<{ id: string; message: string }>;
}

