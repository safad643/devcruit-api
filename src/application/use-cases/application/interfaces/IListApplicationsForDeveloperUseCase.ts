import { ListApplicationsForDeveloperInput, ListApplicationsForDeveloperOutput } from '../../../dtos/application.dto';

export interface IListApplicationsForDeveloperUseCase {
  execute(input: ListApplicationsForDeveloperInput & { developerId: string }): Promise<ListApplicationsForDeveloperOutput>;
}

