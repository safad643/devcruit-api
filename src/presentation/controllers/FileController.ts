import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { IDeleteFileUseCase, IGenerateSignatureUseCase } from '../../application/use-cases/file/interfaces';
import { DeleteFileInput, GenerateSignatureInput } from '../schemas/file.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

@injectable()
export class FileController {
  constructor(
    @inject(TYPES.GenerateSignatureUseCase) private _generateSignatureUseCase: IGenerateSignatureUseCase,
    @inject(TYPES.DeleteFileUseCase) private _deleteFileUseCase: IDeleteFileUseCase
  ) { }

  generateSignature = async (
    request: FastifyRequest<{ Body: GenerateSignatureInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user!.id;
    const { timestamp, category } = request.body;

    const result = await this._generateSignatureUseCase.execute({
      timestamp,
      category,
      userId,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  delete = async (
    request: FastifyRequest<{ Body: DeleteFileInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const result = await this._deleteFileUseCase.execute({
      publicId: request.body.publicId,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };
}
