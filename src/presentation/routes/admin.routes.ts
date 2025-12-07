import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { AdminController } from '../controllers/AdminController';
import { JobFieldController } from '../controllers/JobFieldController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  BlockUserSchema,
  UnblockUserSchema,
  ApproveCompanySchema,
  RejectCompanySchema,
  ListCompaniesSchema,
  ListDevelopersSchema
} from '../schemas/admin.schema';
import {
  CreateJobFieldSchema,
  GetJobFieldsQuerySchema,
  UpdateJobFieldSchema,
  JobFieldIdParamsSchema
} from '../schemas/jobField.schema';

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

  // List companies endpoint
  fastify.post(
    '/admin/list/companies',
    {
      preHandler: authorize('admin'),
      schema: { body: ListCompaniesSchema }
    },
    adminController.listCompanies
  );

  // List developers endpoint
  fastify.post(
    '/admin/list/developers',
    {
      preHandler: authorize('admin'),
      schema: { body: ListDevelopersSchema }
    },
    adminController.listDevelopers
  );

  // Job Fields CRUD endpoints
  const jobFieldController = container.get<JobFieldController>(TYPES.JobFieldController);

  // Create job field
  fastify.post(
    '/admin/job-fields',
    {
      preHandler: authorize('admin'),
      schema: { body: CreateJobFieldSchema }
    },
    jobFieldController.create
  );

  // Get job fields by type
  fastify.get(
    '/admin/job-fields',
    {
      preHandler: authorize('admin'),
      schema: { querystring: GetJobFieldsQuerySchema }
    },
    jobFieldController.getAll
  );

  // Update job field
  fastify.put(
    '/admin/job-fields/:id',
    {
      preHandler: authorize('admin'),
      schema: {
        params: JobFieldIdParamsSchema,
        body: UpdateJobFieldSchema
      }
    },
    jobFieldController.update
  );

  // Delete job field
  fastify.delete(
    '/admin/job-fields/:id',
    {
      preHandler: authorize('admin'),
      schema: { params: JobFieldIdParamsSchema }
    },
    jobFieldController.delete
  );
}


