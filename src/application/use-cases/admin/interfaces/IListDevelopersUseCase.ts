import { ListDevelopersInput, ListDevelopersOutput } from '../../../dtos/admin.dto';

export interface IListDevelopersUseCase {
  execute(input: ListDevelopersInput): Promise<ListDevelopersOutput>;
}

