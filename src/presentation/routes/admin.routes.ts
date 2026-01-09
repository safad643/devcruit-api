import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { AdminController } from '../controllers/AdminController';
import { JobFieldController } from '../controllers/JobFieldController';
import { PlanController } from '../controllers/PlanController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  BlockUserSchema,
  UnblockUserSchema,
  ApproveCompanySchema,
  RejectCompanySchema,
  ListCompaniesSchema,
  ListDevelopersSchema,
  GetCompanyDetailsParamsSchema
} from '../schemas/admin.schema';
import {
  CreateJobFieldSchema,
  GetJobFieldsQuerySchema,
  UpdateJobFieldSchema,
  JobFieldIdParamsSchema
} from '../schemas/jobField.schema';
import {
  CreatePlanSchema,
  UpdatePlanSchema,
  PlanIdParamsSchema,
  ListPlansQuerySchema
} from '../schemas/plan.schema';

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  const adminController = container.get<AdminController>(TYPES.AdminController);

  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', authorize('admin'));

  // Block user endpoint
  fastify.post(
    '/admin/block/user',
    { schema: { body: BlockUserSchema } },
    adminController.blockUser
  );

  // Unblock user endpoint
  fastify.post(
    '/admin/unblock/user',
    { schema: { body: UnblockUserSchema } },
    adminController.unblockUser
  );

  // Approve company endpoint
  fastify.post(
    '/admin/approve/company',
    { schema: { body: ApproveCompanySchema } },
    adminController.approveCompany
  );

  // Reject company endpoint
  fastify.post(
    '/admin/reject/company',
    { schema: { body: RejectCompanySchema } },
    adminController.rejectCompany
  );

  // List companies endpoint
  fastify.post(
    '/admin/list/companies',
    { schema: { body: ListCompaniesSchema } },
    adminController.listCompanies
  );

  // List developers endpoint
  fastify.post(
    '/admin/list/developers',
    { schema: { body: ListDevelopersSchema } },
    adminController.listDevelopers
  );

  // Get company details endpoint
  fastify.get(
    '/admin/companies/:companyId',
    { schema: { params: GetCompanyDetailsParamsSchema } },
    adminController.getCompanyDetails
  );

  // Job Fields CRUD endpoints
  const jobFieldController = container.get<JobFieldController>(TYPES.JobFieldController);

  // Create job field
  fastify.post(
    '/admin/job-fields',
    { schema: { body: CreateJobFieldSchema } },
    jobFieldController.create
  );

  // Get job fields by type
  fastify.get(
    '/admin/job-fields',
    { schema: { querystring: GetJobFieldsQuerySchema } },
    jobFieldController.getAll
  );

  // Update job field
  fastify.put(
    '/admin/job-fields/:id',
    { schema: { params: JobFieldIdParamsSchema, body: UpdateJobFieldSchema } },
    jobFieldController.update
  );

  // Delete job field
  fastify.delete(
    '/admin/job-fields/:id',
    { schema: { params: JobFieldIdParamsSchema } },
    jobFieldController.delete
  );

  // Plan CRUD endpoints
  const planController = container.get<PlanController>(TYPES.PlanController);

  // Create plan
  fastify.post(
    '/admin/plans',
    { schema: { body: CreatePlanSchema } },
    planController.create
  );

  // List all plans (admin - includes inactive)
  fastify.get(
    '/admin/plans',
    { schema: { querystring: ListPlansQuerySchema } },
    planController.listAll
  );

  // Get plan by ID
  fastify.get(
    '/admin/plans/:id',
    { schema: { params: PlanIdParamsSchema } },
    planController.getById
  );

  // Update plan
  fastify.put(
    '/admin/plans/:id',
    { schema: { params: PlanIdParamsSchema, body: UpdatePlanSchema } },
    planController.update
  );

  // Delete plan (soft delete)
  fastify.delete(
    '/admin/plans/:id',
    { schema: { params: PlanIdParamsSchema } },
    planController.delete
  );
}


