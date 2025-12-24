import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { PlanController } from '../controllers/PlanController';

export async function publicPlanRoutes(fastify: FastifyInstance): Promise<void> {
    const controller = container.get<PlanController>(TYPES.PlanController);

    // Public route to list active plans (for company pricing page)
    fastify.get('/', controller.listActive);
}
