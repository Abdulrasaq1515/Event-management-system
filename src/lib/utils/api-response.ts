import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  error: string,
  code: string,
  status: number = 500,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details,
    },
    { status }
  );
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(
  details: Array<{ field: string; message: string }>
): NextResponse {
  return createErrorResponse(
    'Validation failed',
    'VALIDATION_ERROR',
    400,
    details
  );
}

/**
 * Create a not found error response
 */
export function createNotFoundResponse(
  resource: string = 'Resource'
): NextResponse {
  return createErrorResponse(`${resource} not found`, 'NOT_FOUND', 404);
}

/**
 * Create an unauthorized error response
 */
export function createUnauthorizedResponse(): NextResponse {
  return createErrorResponse('Unauthorized access', 'UNAUTHORIZED', 401);
}

/**
 * Create a forbidden error response
 */
export function createForbiddenResponse(message: string = 'Forbidden access'): NextResponse {
  return createErrorResponse(message, 'FORBIDDEN', 403);
}
