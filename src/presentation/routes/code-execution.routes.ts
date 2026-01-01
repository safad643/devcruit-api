import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { CodeExecutionController } from '../controllers/CodeExecutionController';
import { ExecuteCodeSchema } from '../schemas/code-execution.schema';
import { authenticate } from '../middleware/authenticate';

export async function codeExecutionRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.addHook('preHandler', authenticate);
    const controller = container.get<CodeExecutionController>(TYPES.CodeExecutionController);

    fastify.post(
        '/execute',
        { schema: { body: ExecuteCodeSchema } },
        controller.execute
    );
}
