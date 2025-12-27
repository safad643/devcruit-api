import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IFileService } from '../../services';
import { DeleteFileInput, DeleteFileOutput } from '../../dtos/file.dto';

@injectable()
export class DeleteFileUseCase {
  constructor(
    @inject(TYPES.FileService) private _fileService: IFileService
  ) {}

  async execute(input: DeleteFileInput): Promise<DeleteFileOutput> {
    await this._fileService.deleteFile(input.publicId);
    
    return {
      publicId: input.publicId,
      deletedAt: new Date(),
    };
  }
}

