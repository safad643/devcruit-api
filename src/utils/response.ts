/**
 * Response utility functions for consistent API responses
 */

export function wrapSuccess<T>(data: T) {
  return { success: true, data };
}

