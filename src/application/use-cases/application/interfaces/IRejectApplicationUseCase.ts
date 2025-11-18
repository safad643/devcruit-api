import { RejectApplicationInput, RejectApplicationOutput } from '../../../dtos/application.dto';

export interface IRejectApplicationUseCase {
  execute(input: RejectApplicationInput): Promise<RejectApplicationOutput>;
}









