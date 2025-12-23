import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { GET as getById, PUT, DELETE } from './[id]/route';
import type { ApiResponse } from '@/types/api.types';

// Mock the event service to avoid actual database operations
vi.mock('@/lib/services/event.service', () => ({
  eventService: {
    findMany: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));

// Mock the API middleware functions
vi.mock('@/lib/utils/api-middleware', () => ({
  withErrorHandling: vi.fn((handler) => async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Mock proper error handling that returns JSON responses
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
        }),
        { 
          status: 500,
          headers: { 'content-type': 'application/json' }
        }
      );
    }
  }),
  validateRequestBody: vi.fn(),
  validateParams: vi.fn(),
  extractOrganizerId: vi.fn(),
  sanitizeQueryParams: vi.fn(),
  checkRateLimit: vi.fn(() => true),
  handleOptions: vi.fn(() => new Response(null, { status: 200 })),
}));

// Mock the validation schemas
vi.mock('@/lib/validations/event.schemas', () => ({
  createEventSchema: {
    parse: vi.fn((data) => data),
  },
  updateEventSchema: {
    parse: vi.fn((data) => data),
  },
  eventQuerySchema: {
    parse: vi.fn((data) => data),
  },
}));

describe('API Response Consistency Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 8: API Response Consistency', async () => {
    // Feature: events-management-system, Property 8: API Response Consistency
    await fc.assert(
      fc.asyncProperty(
        // Generate different types of API scenarios
        fc.oneof(
          // Success scenarios
          fc.record({
            type: fc.constant('success'),
            method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
            data: fc.oneof(
              fc.object(), 
              fc.array(fc.object()), 
              fc.string(), 
              fc.integer(),
              fc.constant(null) // Allow null but not undefined
            ),
            message: fc.option(fc.string()),
            expectedStatus: fc.constantFrom(200, 201, 204),
          }),
          // Error scenarios
          fc.record({
            type: fc.constant('error'),
            method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
            error: fc.string({ minLength: 1 }),
            code: fc.string({ minLength: 1 }),
            expectedStatus: fc.constantFrom(400, 401, 403, 404, 500),
            details: fc.option(fc.anything()),
          })
        ),
        async (scenario) => {
          let response: Response;
          
          // Mock the service methods based on scenario type
          const { eventService } = await import('@/lib/services/event.service');
          const { validateRequestBody, extractOrganizerId, sanitizeQueryParams } = await import('@/lib/utils/api-middleware');
          
          if (scenario.type === 'success') {
            // Mock successful service responses
            vi.mocked(eventService.findMany).mockResolvedValue({
              data: [scenario.data],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            });
            vi.mocked(eventService.create).mockResolvedValue(scenario.data);
            vi.mocked(eventService.findById).mockResolvedValue(scenario.data);
            vi.mocked(eventService.update).mockResolvedValue(scenario.data);
            vi.mocked(eventService.delete).mockResolvedValue(undefined);
            
            // Mock middleware functions for success
            vi.mocked(validateRequestBody).mockResolvedValue(scenario.data);
            vi.mocked(extractOrganizerId).mockReturnValue('test-organizer-id');
            vi.mocked(sanitizeQueryParams).mockReturnValue({});
            
            // Create mock request
            const mockRequest = new NextRequest('http://localhost:3000/api/events', {
              method: scenario.method,
              headers: { 'x-organizer-id': 'test-organizer-id' },
              body: scenario.method !== 'GET' ? JSON.stringify(scenario.data) : undefined,
            });
            
            // Call the appropriate handler
            switch (scenario.method) {
              case 'GET':
                response = await GET(mockRequest);
                break;
              case 'POST':
                response = await POST(mockRequest);
                break;
              case 'PUT':
                response = await PUT(mockRequest, { params: { id: 'test-id' } });
                break;
              case 'DELETE':
                response = await DELETE(mockRequest, { params: { id: 'test-id' } });
                break;
              default:
                throw new Error(`Unsupported method: ${scenario.method}`);
            }
          } else {
            // Mock error scenarios by making the service methods throw errors
            const error = new Error(scenario.error);
            vi.mocked(eventService.findMany).mockRejectedValue(error);
            vi.mocked(eventService.create).mockRejectedValue(error);
            vi.mocked(eventService.findById).mockRejectedValue(error);
            vi.mocked(eventService.update).mockRejectedValue(error);
            vi.mocked(eventService.delete).mockRejectedValue(error);
            
            // Mock middleware functions to throw errors
            vi.mocked(validateRequestBody).mockRejectedValue(error);
            vi.mocked(extractOrganizerId).mockImplementation(() => {
              throw error;
            });
            
            const mockRequest = new NextRequest('http://localhost:3000/api/events', {
              method: scenario.method,
              headers: {},
              body: scenario.method !== 'GET' ? JSON.stringify({}) : undefined,
            });
            
            // Call the appropriate handler - the withErrorHandling mock will catch errors and return JSON
            switch (scenario.method) {
              case 'GET':
                response = await GET(mockRequest);
                break;
              case 'POST':
                response = await POST(mockRequest);
                break;
              case 'PUT':
                response = await PUT(mockRequest, { params: { id: 'test-id' } });
                break;
              case 'DELETE':
                response = await DELETE(mockRequest, { params: { id: 'test-id' } });
                break;
              default:
                throw new Error(`Unsupported method: ${scenario.method}`);
            }
          }
          
          // Verify response exists
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(Response);
          
          // Parse response body if it exists
          let responseBody: ApiResponse | null = null;
          const responseText = await response.text();
          
          if (responseText && response.status !== 204) {
            try {
              responseBody = JSON.parse(responseText);
            } catch (e) {
              // If response is not JSON, that's also a consistency issue
              expect.fail(`Response body is not valid JSON: ${responseText}`);
            }
          }
          
          // The core property we're testing:
          // For any valid API request, the response should follow the standard ApiResponse format 
          // with appropriate status codes
          
          if (response.status === 204) {
            // DELETE requests should return 204 with no body
            expect(responseText).toBe('');
          } else {
            // All other responses should have a JSON body with the standard format
            expect(responseBody).toBeDefined();
            expect(responseBody).toHaveProperty('success');
            expect(typeof responseBody!.success).toBe('boolean');
            
            if (responseBody!.success) {
              // Success responses should have data property
              expect(responseBody).toHaveProperty('data');
              if ('message' in responseBody! && responseBody.message !== null && responseBody.message !== undefined) {
                expect(typeof responseBody.message).toBe('string');
              }
              
              // Success responses should have 2xx status codes
              expect(response.status).toBeGreaterThanOrEqual(200);
              expect(response.status).toBeLessThan(300);
            } else {
              // Error responses should have error, code, and optional details
              expect(responseBody).toHaveProperty('error');
              expect(responseBody).toHaveProperty('code');
              expect(typeof responseBody.error).toBe('string');
              expect(typeof responseBody.code).toBe('string');
              
              if ('details' in responseBody! && responseBody.details !== undefined) {
                expect(responseBody.details).toBeDefined();
              }
              
              // Error responses should have 4xx or 5xx status codes
              expect(response.status).toBeGreaterThanOrEqual(400);
              expect(response.status).toBeLessThan(600);
            }
          }
          
          // Verify Content-Type header for JSON responses
          if (response.status !== 204) {
            const contentType = response.headers.get('content-type');
            expect(contentType).toContain('application/json');
          }
        }
      ),
      { numRuns: 5 }
    );
  });
});