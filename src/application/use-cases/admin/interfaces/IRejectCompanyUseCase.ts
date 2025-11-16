import { RejectCompanyInput, RejectCompanyOutput } from '../../../dtos/admin.dto';

export interface IRejectCompanyUseCase {
  execute(input: RejectCompanyInput): Promise<RejectCompanyOutput>;
}

