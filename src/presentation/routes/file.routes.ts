import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { FileController } from '../controllers/FileController';
import { DeleteFileSchema, GenerateSignatureSchema } from '../schemas/file.schema';
import { authenticate } from '../middleware/authenticate';

export async function fileRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticate);
  const fileController = container.get<FileController>(TYPES.FileController);

  // Generate Cloudinary upload signature
  fastify.post(
    '/generate-signature',
    { schema: { body: GenerateSignatureSchema } },
    fileController.generateSignature
  );

  // Delete file
  fastify.post(
    '/delete',
    { schema: { body: DeleteFileSchema } },
    fileController.delete
  );
}
