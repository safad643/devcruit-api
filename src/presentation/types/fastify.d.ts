import 'fastify';
import '@fastify/cookie';
import { UserRole } from '../../domain/types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      role: UserRole;
    };
  }

  interface FastifyReply {
    setCookie(name: string, value: string, options?: any): this;
    clearCookie(name: string, options?: any): this;
  }
}
