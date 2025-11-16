export interface ICloseJobUseCase {
  execute(input: { jobId: string; companyId: string }): Promise<{ message: string }>;
}

