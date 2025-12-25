import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', true, fields);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', true);
  }
}

export class SubscriptionRequiredError extends AppError {
  constructor(message = 'Active subscription required') {
    super(message, 'SUBSCRIPTION_REQUIRED', true);
  }
}

export class PlanLimitError extends AppError {
  constructor(resource: string, limit: number) {
    super(`You have reached your plan limit of ${limit} ${resource}`, 'PLAN_LIMIT_EXCEEDED', true);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', true);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error', originalError?: Error) {
    super(message, 'INTERNAL_ERROR', false, undefined, originalError);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 'TOO_MANY_REQUESTS', true);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 'BAD_REQUEST', true);
  }
}


export { AppError };
