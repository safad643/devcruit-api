import 'reflect-metadata';
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import { authRoutes } from './presentation/routes/auth.routes';
import { profileRoutes } from './presentation/routes/profile.routes';
import { fileRoutes } from './presentation/routes/file.routes';
import { globalErrorHandler } from './presentation/middleware/errorHandler';
import { config } from './config';
import { authenticate } from './presentation/middleware/authenticate';
import ajvErrors from 'ajv-errors';  
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
      coerceTypes: false,
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
    errorResponseBuilder: (req, context) => ({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please try again later.'
      }
    })
  });

  // Health check route
  server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
  server.setErrorHandler(globalErrorHandler);

  // Register routes
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(profileRoutes, { prefix: '/api/profile' });
  await server.register(fileRoutes, { prefix: '/api/file' });

 
  return server;
}

export { server };
