import { ListCompaniesInput, ListCompaniesOutput } from '../../../dtos/admin.dto';

export interface IListCompaniesUseCase {
  execute(input: ListCompaniesInput): Promise<ListCompaniesOutput>;
}

