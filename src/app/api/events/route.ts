import { NextRequest } from 'next/server';
import { eventService } from '@/lib/services/event.service';
import { createEventSchema, eventQuerySchema } from '@/lib/validations/event.schemas';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  createUnauthorizedResponse,
  createForbiddenResponse
} from '@/lib/utils/api-response';
import { handleError, AppError, ErrorCode } from '@/lib/utils/error-handler';
import { 
  withErrorHandling,
  validateRequestBody,
  sanitizeQueryParams,
  checkRateLimit,
  handleOptions
} from '@/lib/utils/api-middleware';
import { 
  authenticateRequest, 
  optionalAuth,
  requireEventCreation,
  filterEventsByPermission,
  getUserEventConstraints,
  extractOrganizerId
} from '@/lib/auth';
import type { CreateEventRequest } from '@/types/api.types';

/**
 * OPTIONS /api/events - Handle CORS preflight requests
 */
export async function OPTIONS() {
  return handleOptions();
}

/**
 * GET /api/events - Get paginated list of events with filtering
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Check rate limiting
  if (!checkRateLimit(request)) {
    return createErrorResponse('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
  }

  const { searchParams } = new URL(request.url);
  
  // Sanitize and convert search params to object
  const queryParams = sanitizeQueryParams(searchParams);
  
  // Validate and sanitize query parameters
  const validatedParams = eventQuerySchema.parse(queryParams);
  
  // Get optional authentication context
  const user = optionalAuth(request);
  
  // Use the enhanced authorization system to get events with proper filtering
  const result = await eventService.findManyWithAuthorization(
    validatedParams,
    user?.userId,
    user?.role
  );
  
  return createSuccessResponse(result, 'Events retrieved successfully');
});

/**
 * POST /api/events - Create a new event
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Check rate limiting
  if (!checkRateLimit(request)) {
    return createErrorResponse('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
  }

  // Validate request body first so clients receive validation feedback
  const validatedData = await validateRequestBody(request, createEventSchema);

  // Extract organizer ID (supports both JWT and legacy x-organizer-id header)
  let organizerId;
  try {
    organizerId = extractOrganizerId(request);
  } catch (error) {
    return createUnauthorizedResponse();
  }
  
  // Create event using the service
  const event = await eventService.create(validatedData as CreateEventRequest, organizerId);
  
  return createSuccessResponse(event, 'Event created successfully', 201);
});