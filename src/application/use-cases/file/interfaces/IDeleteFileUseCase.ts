import { DeleteFileInput, DeleteFileOutput } from '../../../dtos/file.dto';

export interface IDeleteFileUseCase {
  execute(input: DeleteFileInput): Promise<DeleteFileOutput>;
}

