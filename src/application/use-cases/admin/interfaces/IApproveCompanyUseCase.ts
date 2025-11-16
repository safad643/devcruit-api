import { ApproveCompanyInput, ApproveCompanyOutput } from '../../../dtos/admin.dto';

export interface IApproveCompanyUseCase {
  execute(input: ApproveCompanyInput): Promise<ApproveCompanyOutput>;
}

