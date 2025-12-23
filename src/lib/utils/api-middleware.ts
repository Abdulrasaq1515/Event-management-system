import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  createErrorResponse, 
  createValidationErrorResponse 
} from './api-response';
import { handleError } from './error-handler';

/**
 * Middleware to handle API route errors consistently
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
        console.error('API Error:', error);

        // Defensive: Some Zod errors might not be recognized by handleError due to
        // module boundary issues. Detect validation errors by shape here as well.
        const maybeZod = error as any;
        if (
          (typeof maybeZod === 'object' && maybeZod !== null && maybeZod.name === 'ZodError') ||
          (typeof maybeZod === 'object' && maybeZod !== null && Array.isArray(maybeZod.issues))
        ) {
          const issues = Array.isArray(maybeZod.issues) ? maybeZod.issues : [];
          const details = issues.map((err: any) => ({
            field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
            message: String(err.message || 'Invalid value'),
          }));

          return createValidationErrorResponse(details);
        }

        const errorResponse = handleError(error);

        if (errorResponse.code === 'VALIDATION_ERROR') {
          return createValidationErrorResponse(
            errorResponse.details as Array<{ field: string; message: string }>
          );
        }

        return createErrorResponse(
          errorResponse.error,
          errorResponse.code,
          500
        );
    }
  };
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON in request body');
    }
    throw error; // Re-throw Zod validation errors
  }
}

/**
 * Validate URL parameters
 */
export function validateParams(
  params: Record<string, string>,
  requiredFields: string[]
): void {
  for (const field of requiredFields) {
    if (!params[field] || params[field].trim() === '') {
      throw new Error(`${field} is required`);
    }
  }
}

/**
 * Extract and validate organizer ID from request headers
 * Uses JWT authentication with fallback to legacy header
 */
export function extractOrganizerId(request: NextRequest): string {
  // Import here to avoid circular dependencies
  const { extractOrganizerId: authExtractOrganizerId } = require('../auth');
  
  try {
    return authExtractOrganizerId(request);
  } catch (error) {
    throw new Error('Authentication required');
  }
}

/**
 * Sanitize and validate query parameters
 */
export function sanitizeQueryParams(
  searchParams: URLSearchParams
): Record<string, string> {
  const params: Record<string, string> = {};
  
  for (const [key, value] of searchParams.entries()) {
    // Basic sanitization - trim whitespace
    const sanitizedValue = value.trim();
    if (sanitizedValue) {
      params[key] = sanitizedValue;
    }
  }
  
  return params;
}

/**
 * Rate limiting placeholder (to be implemented with actual rate limiting)
 */
export function checkRateLimit(request: NextRequest): boolean {
  // TODO: Implement actual rate limiting logic
  // For now, always return true
  return true;
}

/**
 * CORS headers for API responses
 */
export function addCorsHeaders(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-organizer-id');
  
  return response;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export function handleOptions(): Response {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(response);
}