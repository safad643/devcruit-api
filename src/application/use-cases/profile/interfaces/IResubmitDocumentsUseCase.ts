import { ResubmitDocumentsInput, ResubmitDocumentsOutput } from '../../../dtos/profile.dto';

export interface IResubmitDocumentsUseCase {
  execute(input: ResubmitDocumentsInput): Promise<ResubmitDocumentsOutput>;
}

