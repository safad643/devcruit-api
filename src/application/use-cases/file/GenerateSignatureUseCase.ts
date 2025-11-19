import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IFileService } from '../../services';
import { GenerateSignatureInput, GenerateSignatureOutput } from '../../dtos/file.dto';

@injectable()
export class GenerateSignatureUseCase {
  constructor(
    @inject(TYPES.FileService) private fileService: IFileService
  ) {}

  async execute(input: GenerateSignatureInput): Promise<GenerateSignatureOutput> {
    const result = await this.fileService.generateSignature({
      timestamp: input.timestamp,
      category: input.category,
      userId: input.userId,
    });

    return {
      signature: result.signature,
      apiKey: result.apiKey,
      timestamp: result.timestamp,
      folder: result.folder,
    };
  }
}

