import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IFileService } from '../../services';
import { GenerateSignatureInput, GenerateSignatureOutput } from '../../dtos/file.dto';
import { BadRequestError } from '../../../domain/errors';
import { config } from '../../../config';

@injectable()
export class GenerateSignatureUseCase {
  constructor(
    @inject(TYPES.FileService) private fileService: IFileService
  ) {}

  async execute(input: GenerateSignatureInput): Promise<GenerateSignatureOutput> {
    this.validateTimestamp(input.timestamp);

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

  private validateTimestamp(timestamp: number): void {
    const now = Math.floor(Date.now() / 1000);
    const maxAge = config.security.signatureTimestampMaxAgeSeconds;
    if (timestamp < now - maxAge || timestamp > now + maxAge) {
      throw new BadRequestError(
        'Invalid timestamp. Timestamp must be within the last hour and not in the future.'
      );
    }
  }
}

