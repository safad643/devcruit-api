import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { DeleteFileUseCase, GenerateSignatureUseCase } from '../../application/use-cases/file';
import { BadRequestError } from '../../domain/errors';
import { DeleteFileInput, GenerateSignatureInput } from '../schemas/file.schema';

@injectable()
export class FileController {
  constructor(
    @inject(TYPES.GenerateSignatureUseCase) private generateSignatureUseCase: GenerateSignatureUseCase,
    @inject(TYPES.DeleteFileUseCase) private deleteFileUseCase: DeleteFileUseCase
  ) { }

  generateSignature = async (
    request: FastifyRequest<{ Body: GenerateSignatureInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user!.id;
    const { timestamp, category } = request.body;

    // Validate timestamp is not too old (within 1 hour)
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 3600; // 1 hour in seconds
    if (timestamp < now - maxAge || timestamp > now + maxAge) {
      throw new BadRequestError('Invalid timestamp. Timestamp must be within the last hour and not in the future.');
    }

    const result = await this.generateSignatureUseCase.execute({
      timestamp,
      category,
      userId,
    });

    reply.status(200).send(result);
  };

  delete = async (
    request: FastifyRequest<{ Body: DeleteFileInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const result = await this.deleteFileUseCase.execute({
      publicId: request.body.publicId,
    });

    reply.status(200).send(result);
  };
}
