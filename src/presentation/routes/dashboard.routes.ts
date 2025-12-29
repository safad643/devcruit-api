// src/presentation/routes/dashboard.routes.ts
import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { checkCompanyPaid } from '../middleware/checkCompanyPaid';

export async function dashboardRoutes(fastify: FastifyInstance): Promise<void> {
    const dashboardController = container.get<DashboardController>(TYPES.DashboardController);

    // Company dashboard endpoint
    fastify.get(
        '/company/dashboard',
        {
            preHandler: [authenticate, authorize('company', 'hr'), checkCompanyPaid]
        },
        dashboardController.getCompanyDashboard
    );

    // Admin dashboard endpoint
    fastify.get(
        '/admin/dashboard',
        {
            preHandler: [authenticate, authorize('admin')]
        },
        dashboardController.getAdminDashboard
    );
}

