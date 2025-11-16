import { GetApplicationDetailsOutput } from '../../../dtos/application.dto';

export interface IGetApplicationDetailsUseCase {
  execute(applicationId: string, companyId: string): Promise<GetApplicationDetailsOutput>;
}

