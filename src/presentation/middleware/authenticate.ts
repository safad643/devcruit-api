import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ITokenService } from '../../application/services';
import { UnauthorizedError } from '../../domain/errors';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      throw new UnauthorizedError('Authorization header missing');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Invalid authorization format. Use: Bearer <token>');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedError('Access token missing');
    }

    // Verify token
    const tokenService = container.get<ITokenService>(TYPES.TokenService);
    const payload = tokenService.verifyAccessToken(token);

    // Attach user to request
    request.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role
    };

  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    
    // Token verification failed (expired, invalid signature, etc.)
    throw new UnauthorizedError('Invalid or expired access token');
  }
}
