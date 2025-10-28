import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IFileService } from '../../services';
import { FileCategory } from '../../../domain/types';

export interface GenerateSignatureInput {
  timestamp: number;
  category: FileCategory;
  userId: string;
}

export interface GenerateSignatureOutput {
  signature: string;
  apiKey: string;
  timestamp: number;
  folder: string;
}

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

