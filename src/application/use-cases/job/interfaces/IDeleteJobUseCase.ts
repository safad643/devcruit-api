export interface IDeleteJobUseCase {
  execute(input: { jobId: string; companyId: string }): Promise<void>;
}

