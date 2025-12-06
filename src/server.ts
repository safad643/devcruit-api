
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import { authRoutes } from './presentation/routes/auth.routes';
import { profileRoutes } from './presentation/routes/profile.routes';
import { fileRoutes } from './presentation/routes/file.routes';
import { adminRoutes } from './presentation/routes/admin.routes';
import { paymentRoutes } from './presentation/routes/payment.routes';
import { jobRoutes } from './presentation/routes/job.routes';
import { publicJobRoutes } from './presentation/routes/public.jobs.routes';
import { applicationRoutes } from './presentation/routes/application.routes';
import { chatRoutes } from './presentation/routes/chat.routes';
import fastifyRawBody from 'fastify-raw-body';
import { globalErrorHandler } from './presentation/middleware/errorHandler';
import { config } from './config';
import ajvErrors from 'ajv-errors';
import { HttpStatus } from './utils/statusCodes';
import { TooManyRequestsError } from './domain/errors';
const server = Fastify({
  logger: {
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
    transport: config.nodeEnv === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,req,res,responseTime',
        singleLine: true,
        messageFormat: '{msg}'
      }
    } : undefined
  }
  ,
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      useDefaults: true,
      allErrors: true
    },
    plugins: [ajvErrors]
  }
}).withTypeProvider<TypeBoxTypeProvider>();

export async function buildServer() {
  // Register security plugins
  await server.register(helmet, {
    contentSecurityPolicy: config.nodeEnv === 'production'
  });

  await server.register(cors, {
    origin: config.cors.origin || 'http://localhost:3000',
    credentials: true
  });

  await server.register(cookie, {
    secret: config.cookie.secret,
    parseOptions: {}
  });

  // Rate limiting
  await server.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes',
    errorResponseBuilder: () => {
      throw new TooManyRequestsError('Rate limit exceeded. Please try again later.');
    },
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true
    }
  });

  // Raw body plugin for Stripe webhooks (route-scoped)
  await server.register(fastifyRawBody, {
    field: 'rawBody',
    global: false,
    encoding: false,
    runFirst: true
  });

  // Health check route
  server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
  server.setErrorHandler(globalErrorHandler);

  // Register routes
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(profileRoutes, { prefix: '/api/profile' });
  await server.register(fileRoutes, { prefix: '/api/file' });
  await server.register(adminRoutes, { prefix: '/api' });
  await server.register(paymentRoutes, { prefix: '/api/payment' });
  await server.register(jobRoutes, { prefix: '/api/company' });
  await server.register(publicJobRoutes, { prefix: '/api/jobs' });
  await server.register(applicationRoutes, { prefix: '/api' });
  await server.register(chatRoutes, { prefix: '/api/chat' });


  return server;
}

export { server };
