import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { PUT } from './[id]/route';
import { createEventSchema, updateEventSchema } from '@/lib/validations/event.schemas';
import { z } from 'zod';
import type { ApiResponse } from '@/types/api.types';

// Safety helper for Date -> ISO string mapping to avoid RangeError on invalid dates
const toISOStringSafe = (d: Date) => (isNaN(d.getTime()) ? 'invalid-date' : d.toISOString());

// Mock the event service to avoid actual database operations
vi.mock('@/lib/services/event.service', () => ({
  eventService: {
    create: vi.fn(),
    update: vi.fn(),
  }
}));

// Mock the API middleware functions - we want to test actual validation
vi.mock('@/lib/utils/api-middleware', () => ({
  withErrorHandling: vi.fn((handler) => async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Import the actual error handler to test real validation error processing
      const { handleError } = await import('@/lib/utils/error-handler');
      const { createValidationErrorResponse, createErrorResponse } = await import('@/lib/utils/api-response');
      
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
  }),
  validateRequestBody: async (request: NextRequest, schema: z.ZodSchema) => {
    const body = await request.json();
    return schema.parse(body); // This will throw ZodError for invalid data
  },
  validateParams: vi.fn(() => undefined),
  extractOrganizerId: vi.fn(() => 'test-organizer-id'),
  checkRateLimit: vi.fn(() => true),
}));

describe('API Validation Error Handling Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 9: API Validation Error Handling', async () => {
    // Feature: events-management-system, Property 9: API Validation Error Handling
    await fc.assert(
      fc.asyncProperty(
        // Generate various types of invalid event data
        fc.oneof(
          // Invalid title (too short)
          fc.record({
            title: fc.string({ maxLength: 2 }), // Too short
            description: fc.string({ minLength: 10, maxLength: 100 }),
            startDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            timezone: fc.constant('UTC'),
            location: fc.constant({ type: 'virtual', url: 'https://example.com' }),
            images: fc.constant({ 
              thumbnail: 'https://example.com/thumb.jpg', 
              banner: 'https://example.com/banner.jpg' 
            }),
          }).filter(data => new Date(data.endDateTime) > new Date(data.startDateTime)),
          
          // Invalid title (too long)
          fc.record({
            title: fc.string({ minLength: 201, maxLength: 300 }), // Too long
            description: fc.string({ minLength: 10, maxLength: 100 }),
            startDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            timezone: fc.constant('UTC'),
            location: fc.constant({ type: 'virtual', url: 'https://example.com' }),
            images: fc.constant({ 
              thumbnail: 'https://example.com/thumb.jpg', 
              banner: 'https://example.com/banner.jpg' 
            }),
          }).filter(data => new Date(data.endDateTime) > new Date(data.startDateTime)),
          
          // Invalid description (too short)
          fc.record({
            title: fc.string({ minLength: 3, maxLength: 50 }),
            description: fc.string({ maxLength: 9 }), // Too short
            startDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            timezone: fc.constant('UTC'),
            location: fc.constant({ type: 'virtual', url: 'https://example.com' }),
            images: fc.constant({ 
              thumbnail: 'https://example.com/thumb.jpg', 
              banner: 'https://example.com/banner.jpg' 
            }),
          }).filter(data => new Date(data.endDateTime) > new Date(data.startDateTime)),
          
          // Invalid date format
          fc.record({
            title: fc.string({ minLength: 3, maxLength: 50 }),
            description: fc.string({ minLength: 10, maxLength: 100 }),
            startDateTime: fc.constant('invalid-date'), // Invalid format
            endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            timezone: fc.constant('UTC'),
            location: fc.constant({ type: 'virtual', url: 'https://example.com' }),
            images: fc.constant({ 
              thumbnail: 'https://example.com/thumb.jpg', 
              banner: 'https://example.com/banner.jpg' 
            }),
          }),
          
          // Invalid location URL
          fc.record({
            title: fc.string({ minLength: 3, maxLength: 50 }),
            description: fc.string({ minLength: 10, maxLength: 100 }),
            startDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            timezone: fc.constant('UTC'),
            location: fc.constant({ type: 'virtual', url: 'not-a-valid-url' }), // Invalid URL
            images: fc.constant({ 
              thumbnail: 'https://example.com/thumb.jpg', 
              banner: 'https://example.com/banner.jpg' 
            }),
          }).filter(data => new Date(data.endDateTime) > new Date(data.startDateTime)),
          
          // Invalid capacity (negative)
          fc.record({
            title: fc.string({ minLength: 3, maxLength: 50 }),
            description: fc.string({ minLength: 10, maxLength: 100 }),
            startDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            timezone: fc.constant('UTC'),
            location: fc.constant({ type: 'virtual', url: 'https://example.com' }),
            capacity: fc.integer({ max: -1 }), // Negative capacity
            images: fc.constant({ 
              thumbnail: 'https://example.com/thumb.jpg', 
              banner: 'https://example.com/banner.jpg' 
            }),
          }).filter(data => new Date(data.endDateTime) > new Date(data.startDateTime)),
          
          // Invalid image URLs
          fc.record({
            title: fc.string({ minLength: 3, maxLength: 50 }),
            description: fc.string({ minLength: 10, maxLength: 100 }),
            startDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            timezone: fc.constant('UTC'),
            location: fc.constant({ type: 'virtual', url: 'https://example.com' }),
            images: fc.constant({ 
              thumbnail: 'not-a-valid-url', // Invalid URL
              banner: 'https://example.com/banner.jpg' 
            }),
          }).filter(data => new Date(data.endDateTime) > new Date(data.startDateTime)),
          
          // Invalid date order (end before start)
          fc.record({
            title: fc.string({ minLength: 3, maxLength: 50 }),
            description: fc.string({ minLength: 10, maxLength: 100 }),
            startDateTime: fc.date({ min: new Date('2024-06-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-05-31') })
              .map(toISOStringSafe),
            timezone: fc.constant('UTC'),
            location: fc.constant({ type: 'virtual', url: 'https://example.com' }),
            images: fc.constant({ 
              thumbnail: 'https://example.com/thumb.jpg', 
              banner: 'https://example.com/banner.jpg' 
            }),
          }).filter(data => new Date(data.endDateTime) <= new Date(data.startDateTime)), // Ensure invalid order
          
          // Missing required fields
          fc.record({
            title: fc.string({ minLength: 3, maxLength: 50 }),
            // Missing description
            startDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            timezone: fc.constant('UTC'),
            location: fc.constant({ type: 'virtual', url: 'https://example.com' }),
            images: fc.constant({ 
              thumbnail: 'https://example.com/thumb.jpg', 
              banner: 'https://example.com/banner.jpg' 
            }),
          }).filter(data => new Date(data.endDateTime) > new Date(data.startDateTime)),
          
          // Invalid price data
          fc.record({
            title: fc.string({ minLength: 3, maxLength: 50 }),
            description: fc.string({ minLength: 10, maxLength: 100 }),
            startDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
              .map(toISOStringSafe),
            timezone: fc.constant('UTC'),
            location: fc.constant({ type: 'virtual', url: 'https://example.com' }),
            price: fc.constant({
              amount: -10, // Negative amount
              currency: 'INVALID', // Invalid currency format
              type: 'paid'
            }),
            images: fc.constant({ 
              thumbnail: 'https://example.com/thumb.jpg', 
              banner: 'https://example.com/banner.jpg' 
            }),
          }).filter(data => new Date(data.endDateTime) > new Date(data.startDateTime))
        ),
        fc.constantFrom('POST', 'PUT'), // Test both create and update endpoints
        async (invalidEventData, method) => {
          // Create mock request with invalid data
          const mockRequest = new NextRequest(
            method === 'POST' 
              ? 'http://localhost:3000/api/events'
              : 'http://localhost:3000/api/events/test-id',
            {
              method,
              headers: { 
                'content-type': 'application/json',
                'x-organizer-id': 'test-organizer-id'
              },
              body: JSON.stringify(invalidEventData),
            }
          );
          
          let response: Response;
          
          // Call the appropriate handler
          if (method === 'POST') {
            response = await POST(mockRequest);
          } else {
            response = await PUT(mockRequest, { params: { id: 'test-id' } });
          }
          
          // The core property we're testing:
          // For any invalid API request data, the response should return 400 status 
          // with specific error messages for each invalid field
          
          // Verify response exists and has correct status
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(Response);

          // It's possible that the generated "invalid" sample actually passes the
          // partial update schema (e.g. trimming or optional fields), in which
          // case the handler will proceed to authenticate and return 401 for
          // unauthenticated requests. Accept 401 when the payload is actually
          // valid for the endpoint; otherwise require 400 for validation errors.
          if (response.status === 401) {
            const schema = method === 'POST' ? createEventSchema : updateEventSchema;
            try {
              schema.parse(invalidEventData as any);
              // If parsing succeeds, 401 is an acceptable outcome here
              return;
            } catch (e) {
              // If parsing fails, a 401 is unexpected — fail the test
              expect.fail('Received 401 for payload that should be invalid');
            }
          }

          expect(response.status).toBe(400);
          
          // Parse response body
          const responseText = await response.text();
          expect(responseText).toBeTruthy();
          
          let responseBody: ApiResponse;
          try {
            responseBody = JSON.parse(responseText);
          } catch (e) {
            expect.fail(`Response body is not valid JSON: ${responseText}`);
          }
          
          // Verify standard error response format
          expect(responseBody).toHaveProperty('success');
          expect(responseBody.success).toBe(false);
          expect(responseBody).toHaveProperty('error');
          expect(responseBody).toHaveProperty('code');
          expect(responseBody.code).toBe('VALIDATION_ERROR');
          
          // Verify specific error messages are provided
          expect(responseBody).toHaveProperty('details');
          expect(Array.isArray(responseBody.details)).toBe(true);
          expect(responseBody.details.length).toBeGreaterThan(0);
          
          // Each validation error should have field and message
          for (const detail of responseBody.details as Array<{ field: string; message: string }>) {
            expect(detail).toHaveProperty('field');
            expect(detail).toHaveProperty('message');
            expect(typeof detail.field).toBe('string');
            expect(typeof detail.message).toBe('string');
            expect(detail.field.length).toBeGreaterThan(0);
            expect(detail.message.length).toBeGreaterThan(0);
          }
          
          // Verify Content-Type header
          const contentType = response.headers.get('content-type');
          expect(contentType).toContain('application/json');
        }
      ),
      { numRuns: 100 }
    );
  });
});