export interface IOpenJobUseCase {
  execute(input: { jobId: string; companyId: string }): Promise<{ message: string }>;
}

