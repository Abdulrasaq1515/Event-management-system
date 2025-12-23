import { NextRequest } from 'next/server';
import { eventService } from '@/lib/services/event.service';
import { updateEventSchema } from '@/lib/validations/event.schemas';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  createNotFoundResponse,
  createForbiddenResponse,
  createUnauthorizedResponse
} from '@/lib/utils/api-response';
import { handleError, AppError, ErrorCode } from '@/lib/utils/error-handler';
import { 
  withErrorHandling,
  validateRequestBody,
  validateParams,
  checkRateLimit,
  handleOptions
} from '@/lib/utils/api-middleware';
import { 
  authenticateRequest,
  optionalAuth,
  requireEventAccess,
  canAccessEvent
} from '@/lib/auth';
import type { UpdateEventRequest } from '@/types/api.types';

/**
 * OPTIONS /api/events/[id] - Handle CORS preflight requests
 */
export async function OPTIONS() {
  return handleOptions();
}

/**
 * GET /api/events/[id] - Get a single event by ID
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // Check rate limiting
  if (!checkRateLimit(request)) {
    return createErrorResponse('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
  }

  // Await params in Next.js 14
  const resolvedParams = await params;
  
  // Validate required parameters
  validateParams(resolvedParams, ['id']);
  const { id } = resolvedParams;
  
  // Get optional authentication context
  const user = optionalAuth(request);
  
  // Use the enhanced authorization system to verify event access
  try {
    const event = await eventService.verifyEventAccess(
      id, 
      user?.userId || '', 
      user?.role || 'user', 
      'read'
    );
    
    return createSuccessResponse(event, 'Event retrieved successfully');
  } catch (error) {
    if (error instanceof AppError) {
      if (error.code === ErrorCode.NOT_FOUND) {
        return createNotFoundResponse('Event');
      }
      if (error.code === ErrorCode.FORBIDDEN) {
        return createNotFoundResponse('Event'); // Return 404 instead of 403 for privacy
      }
    }
    throw error;
  }
});

/**
 * PUT /api/events/[id] - Update an existing event
 */
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // Check rate limiting
  if (!checkRateLimit(request)) {
    return createErrorResponse('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
  }

  // Await params in Next.js 14
  const resolvedParams = await params;
  
  // Validate required parameters
  validateParams(resolvedParams, ['id']);
  const { id } = resolvedParams;
  
  // Authenticate user
  // Validate request body first so clients receive validation feedback
  const validatedData = await validateRequestBody(request, updateEventSchema);

  // Authenticate user
  let user;
  try {
    user = authenticateRequest(request);
  } catch (error) {
    return createUnauthorizedResponse();
  }
  
  // Use the enhanced authorization system to verify event access
  try {
    await eventService.verifyEventAccess(id, user.userId, user.role, 'update');
  } catch (error) {
    if (error instanceof AppError) {
      if (error.code === ErrorCode.NOT_FOUND) {
        return createNotFoundResponse('Event');
      }
      if (error.code === ErrorCode.FORBIDDEN) {
        return createForbiddenResponse(error.message);
      }
    }
    throw error;
  }
  
  // Update event using the service
  const event = await eventService.update(id, validatedData as UpdateEventRequest, user.userId);
  
  return createSuccessResponse(event, 'Event updated successfully');
});

/**
 * DELETE /api/events/[id] - Delete (archive) an event
 */
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // Check rate limiting
  if (!checkRateLimit(request)) {
    return createErrorResponse('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
  }

  // Await params in Next.js 14
  const resolvedParams = await params;
  
  // Validate required parameters
  validateParams(resolvedParams, ['id']);
  const { id } = resolvedParams;
  
  // Authenticate user
  let user;
  try {
    user = authenticateRequest(request);
  } catch (error) {
    return createUnauthorizedResponse();
  }
  
  // Use the enhanced authorization system to verify event access
  try {
    await eventService.verifyEventAccess(id, user.userId, user.role, 'delete');
  } catch (error) {
    if (error instanceof AppError) {
      if (error.code === ErrorCode.NOT_FOUND) {
        return createNotFoundResponse('Event');
      }
      if (error.code === ErrorCode.FORBIDDEN) {
        return createForbiddenResponse(error.message);
      }
    }
    throw error;
  }
  
  // Delete (archive) event using the service
  await eventService.delete(id, user.userId);
  
  // Return 204 No Content for successful deletion
  return new Response(null, { status: 204 });
});