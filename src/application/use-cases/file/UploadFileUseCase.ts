import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IFileService } from '../../services';
import { UploadFileInput, UploadFileOutput } from '../../dtos/file.dto';

@injectable()
export class UploadFileUseCase {
  constructor(
    @inject(TYPES.FileService) private fileService: IFileService
  ) {}

  async execute(input: UploadFileInput): Promise<UploadFileOutput> {
    const { url, publicId } = await this.fileService.uploadFile(
      input.file,
      input.filename,
      input.mimetype,
      input.category,
      input.userId
    );

    return {
      url,
      publicId,
      category: input.category,
      uploadedAt: new Date(),
    };
  }
}
