import { UnblockUserInput, UnblockUserOutput } from '../../../dtos/admin.dto';

export interface IUnblockUserUseCase {
  execute(input: UnblockUserInput): Promise<UnblockUserOutput>;
}

