import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { AdminController } from '../controllers/AdminController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  BlockUserSchema,
  UnblockUserSchema,
  ApproveCompanySchema,
  RejectCompanySchema
} from '../schemas/admin.schema';

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  const adminController = container.get<AdminController>(TYPES.AdminController);

  // Require authentication for all admin routes
  fastify.addHook('preHandler', authenticate);

  // Block user endpoint
  fastify.post(
    '/admin/block/user',
    {
      preHandler: authorize('admin'),
      schema: { body: BlockUserSchema }
    },
    adminController.blockUser
  );

  // Unblock user endpoint
  fastify.post(
    '/admin/unblock/user',
    {
      preHandler: authorize('admin'),
      schema: { body: UnblockUserSchema }
    },
    adminController.unblockUser
  );

  // Approve company endpoint
  fastify.post(
    '/admin/approve/company',
    {
      preHandler: authorize('admin'),
      schema: { body: ApproveCompanySchema }
    },
    adminController.approveCompany
  );

  // Reject company endpoint
  fastify.post(
    '/admin/reject/company',
    {
      preHandler: authorize('admin'),
      schema: { body: RejectCompanySchema }
    },
    adminController.rejectCompany
  );
}


