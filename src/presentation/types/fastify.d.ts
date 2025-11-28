import 'fastify';
import '@fastify/cookie';
import { UserRole } from '../../domain/types';
import { CompanyProfile } from '../../domain/entities/CompanyProfile';
import { CompanyTeamMember } from '../../domain/repositories';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      role: UserRole;
    };
    rawBody?: Buffer;
    companyContext?: {
      companyProfile: CompanyProfile;
      companyUserId: string;
      teamMemberId?: string;
      teamMemberRole?: 'hr' | 'interviewer';
      teamMember?: CompanyTeamMember;
    };
  }

  interface FastifyReply {
    setCookie(name: string, value: string, options?: any): this;
    clearCookie(name: string, options?: any): this;
  }
}
