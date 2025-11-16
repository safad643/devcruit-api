import { ListApplicationsForCompanyInput, ListApplicationsForCompanyOutput } from '../../../dtos/application.dto';

export interface IListApplicationsForCompanyUseCase {
  execute(input: ListApplicationsForCompanyInput & { companyId: string }): Promise<ListApplicationsForCompanyOutput>;
}

