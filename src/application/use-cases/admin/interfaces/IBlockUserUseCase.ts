import { BlockUserInput, BlockUserOutput } from '../../../dtos/admin.dto';

export interface IBlockUserUseCase {
  execute(input: BlockUserInput): Promise<BlockUserOutput>;
}

