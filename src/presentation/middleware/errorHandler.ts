import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  SubscriptionRequiredError,
  PlanLimitError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError
} from '../../domain/errors';
import { HttpStatus } from '../../utils/statusCodes';

// Map domain errors to HTTP status codes
function getStatusCode(error: AppError): number {


  if (error instanceof ValidationError) return HttpStatus.BAD_REQUEST;
  if (error instanceof UnauthorizedError) return HttpStatus.UNAUTHORIZED;
  if (error instanceof ForbiddenError) return HttpStatus.FORBIDDEN;
  if (error instanceof SubscriptionRequiredError) return HttpStatus.FORBIDDEN;
  if (error instanceof PlanLimitError) return HttpStatus.FORBIDDEN;
  if (error instanceof TooManyRequestsError) return HttpStatus.TOO_MANY_REQUESTS;
  if (error instanceof NotFoundError) return HttpStatus.NOT_FOUND;
  if (error instanceof ConflictError) return HttpStatus.CONFLICT;
  return HttpStatus.INTERNAL_SERVER_ERROR;
}

export function globalErrorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {


  if (error instanceof AppError) {
    const statusCode = getStatusCode(error);

    // Log non-operational errors with original error details
    if (!error.isOperational) {
      // Correct syntax: object first, message second
      request.log.error({
        message: error.message,
        code: error.code,
        stack: error.stack,
        originalError: error.originalError?.stack,
        url: request.url,
        method: request.method,
      }, 'Non-operational error');

    }

    return reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields && { fields: error.fields }),
      },
    });
  }

  // Handle Fastify validation errors
  if ('validation' in error && error.validation) {
    const fields: Record<string, string> = {};
    error.validation.forEach((err) => {
      const field = (err.instancePath.replace('/', '') || err.params?.missingProperty) as string;
      fields[field] = err.message || 'Validation failed';
    });

    return reply.status(HttpStatus.BAD_REQUEST).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        fields,
      },
    });
  }

  // Log unexpected errors
  request.log.error({
    message: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
  }, 'Unexpected error');



  // Don't leak error details for programmer errors
  return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
