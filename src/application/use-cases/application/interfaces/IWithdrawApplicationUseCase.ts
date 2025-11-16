import { WithdrawApplicationInput, WithdrawApplicationOutput } from '../../../dtos/application.dto';

export interface IWithdrawApplicationUseCase {
  execute(input: WithdrawApplicationInput & { developerId: string }): Promise<WithdrawApplicationOutput>;
}

