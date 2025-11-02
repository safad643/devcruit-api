import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../../domain/types';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors';

export function authorize(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }
  };
}
