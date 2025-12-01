import { MarkMessageAsReadInput, MarkMessageAsReadOutput } from '../../../dtos/chat.dto';

export interface IMarkMessageAsReadUseCase {
  execute(input: MarkMessageAsReadInput & { userId: string }): Promise<MarkMessageAsReadOutput>;
}

