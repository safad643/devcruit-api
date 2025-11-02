export class AppError extends Error {
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly fields?: Record<string, string>;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: string,
    isOperational = true,
    fields?: Record<string, string>,
    originalError?: Error
  ) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;
    this.fields = fields;
    this.originalError = originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
