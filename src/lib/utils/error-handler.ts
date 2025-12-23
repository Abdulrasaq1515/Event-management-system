import { z } from 'zod';

// Error Types and Handling
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  WEB3_ERROR = 'WEB3_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error Handler Function
export function handleError(error: unknown): {
  success: false;
  error: string;
  code: string;
  details?: unknown;
} {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  // Detect Zod validation errors. Use structural checks in addition to instanceof
  // because `instanceof z.ZodError` can fail when multiple copies of zod exist
  // in the test/runtime environment (causing unpredictable behavior).
  // Accept objects with `name === 'ZodError'` and an `issues` array.
  const maybeZod = error as any;
  // Consider it a Zod validation error if it has an `issues` array or matches ZodError shape
  if (
    (typeof maybeZod === 'object' && maybeZod !== null && maybeZod.name === 'ZodError') ||
    (maybeZod instanceof z.ZodError) ||
    (typeof maybeZod === 'object' && maybeZod !== null && Array.isArray((maybeZod as any).issues))
  ) {
    const issues = Array.isArray((maybeZod as any).issues) ? (maybeZod as any).issues : [];
    return {
      success: false,
      error: 'Validation failed',
      code: ErrorCode.VALIDATION_ERROR,
      details: issues.map((err: any) => ({
        field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
        message: String(err.message || 'Invalid value'),
      })),
    };
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  return {
    success: false,
    error: 'An unexpected error occurred',
    code: ErrorCode.INTERNAL_ERROR,
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
