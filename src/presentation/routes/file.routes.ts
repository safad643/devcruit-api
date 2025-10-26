import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { FileController } from '../controllers/FileController';
import { DeleteFileSchema } from '../schemas/file.schema';

export async function fileRoutes(fastify: FastifyInstance): Promise<void> {
  
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, 
    },
  });

  const fileController = container.get<FileController>(TYPES.FileController);

  fastify.post(
    '/upload',
    fileController.upload
  );

  fastify.post('/delete',{schema: { body: DeleteFileSchema }},fileController.delete);
}
