import { PublicJobDetail } from '../../../dtos/job.dto';

export interface IPublicGetJobUseCase {
  execute(id: string): Promise<PublicJobDetail>;
}

