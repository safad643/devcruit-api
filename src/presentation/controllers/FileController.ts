import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { UploadFileUseCase, DeleteFileUseCase } from '../../application/use-cases/file';
import { BadRequestError } from '../../domain/errors';
import { DeleteFileInput } from '../schemas/file.schema';

@injectable()
export class FileController {
  constructor(
    @inject(TYPES.UploadFileUseCase) private uploadFileUseCase: UploadFileUseCase,
    @inject(TYPES.DeleteFileUseCase) private deleteFileUseCase: DeleteFileUseCase
  ) {}

  upload = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user!.id;

    const data = await request.file();

    if (!data) {
      throw new BadRequestError('No file provided');
    }

    const categoryField = data.fields.category as any;
    const category = Array.isArray(categoryField) ? categoryField[0]?.value : categoryField?.value;
    
    // Validate category against schema
    const validCategories = ['PROFILE_PICTURE', 'DEGREE_CERTIFICATE', 'CV'];
    if (!category || !validCategories.includes(category)) {
      throw new BadRequestError('Invalid category');
    }

    const fileBuffer = await data.toBuffer();
    
    const result = await this.uploadFileUseCase.execute({
      file: fileBuffer,
      filename: data.filename,
      mimetype: data.mimetype,
      category: category as 'PROFILE_PICTURE' | 'DEGREE_CERTIFICATE' | 'CV',
      userId,
    });

    reply.status(200).send(result);
  };

  delete = async (
    request: FastifyRequest<{ Body: DeleteFileInput}>,
    reply: FastifyReply
  ): Promise<void> => {
    const result = await this.deleteFileUseCase.execute({
      publicId: request.body.publicId,
    });

    reply.status(200).send(result);
  };
}
