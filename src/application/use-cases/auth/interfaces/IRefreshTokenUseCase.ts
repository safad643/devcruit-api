import { RefreshTokenInput, RefreshTokenOutput } from '../../../dtos/auth.dto';

export interface IRefreshTokenUseCase {
  execute(input: RefreshTokenInput): Promise<RefreshTokenOutput>;
}

