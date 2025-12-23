import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { verifyEventOwnership, canAccessEvent, requireEventAccess } from './authorization';
import { EventService } from '../services/event.service';
import type { JWTPayload, UserRole } from './types';
import type { Event, EventStatus, EventVisibility } from '../db/schema';
import { AppError, ErrorCode } from '../utils/error-handler';
import { v4 as uuidv4 } from 'uuid';

// Mock the event service to avoid actual database operations during property testing
vi.mock('../services/event.service', () => ({
  eventService: {
    findById: vi.fn(),
  }
}));

// Helper function to create mock JWT payload
function createMockJWTPayload(overrides: Partial<JWTPayload> = {}): JWTPayload {
  return {
    userId: uuidv4(),
    email: 'test@example.com',
    role: 'organizer' as UserRole,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides
  };
}

// Helper function to create mock event
function createMockEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: uuidv4(),
    slug: 'test-event',
    title: 'Test Event',
    description: 'Test description',
    excerpt: null,
    startDateTime: new Date('2024-06-01T10:00:00Z'),
    endDateTime: new Date('2024-06-01T12:00:00Z'),
    timezone: 'UTC',
    location: { type: 'virtual', url: 'https://example.com' },
    capacity: null,
    currentAttendees: 0,
    status: 'draft' as EventStatus,
    visibility: 'public' as EventVisibility,
    organizerId: uuidv4(),
    categoryId: null,
    price: null,
    images: { thumbnail: 'https://example.com/thumb.jpg', banner: 'https://example.com/banner.jpg' },
    metadata: {},
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: null,
    ...overrides
  };
}

describe('Authorization Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 11: Authorization Verification', async () => {
    // Feature: events-management-system, Property 11: Authorization Verification
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // eventId
        fc.uuid(), // eventOwnerId
        fc.uuid(), // requestingUserId (different from owner)
        fc.constantFrom('organizer', 'admin', 'user') as fc.Arbitrary<UserRole>, // requesting user role
        fc.constantFrom('draft', 'published', 'cancelled', 'completed') as fc.Arbitrary<EventStatus>, // event status
        fc.constantFrom('public', 'private', 'unlisted') as fc.Arbitrary<EventVisibility>, // event visibility
        fc.constantFrom('read', 'update', 'delete', 'publish') as fc.Arbitrary<'read' | 'update' | 'delete' | 'publish'>, // operation type
        async (eventId, eventOwnerId, requestingUserId, requestingUserRole, eventStatus, eventVisibility, operation) => {
          // Ensure requesting user is different from event owner (except for admin tests)
          if (requestingUserRole !== 'admin') {
            fc.pre(requestingUserId !== eventOwnerId);
          }

          // Create mock event owned by eventOwnerId
          const mockEvent = createMockEvent({
            id: eventId,
            organizerId: eventOwnerId,
            status: eventStatus,
            visibility: eventVisibility,
          });

          // Create mock JWT payload for requesting user
          const requestingUser = createMockJWTPayload({
            userId: requestingUserId,
            role: requestingUserRole,
          });

          // Mock the event service findById method
          const mockEventService = await import('../services/event.service');
          vi.mocked(mockEventService.eventService.findById).mockResolvedValue(mockEvent);

          // Test authorization logic based on user role and operation
          if (requestingUserRole === 'admin') {
            // Admin users should have access to all operations on all events
            const hasAccess = await canAccessEvent(requestingUser, eventId, operation);
            expect(hasAccess).toBe(true);

            // requireEventAccess should not throw for admin users
            const event = await requireEventAccess(requestingUser, eventId, operation);
            expect(event).toEqual(mockEvent);

            // verifyEventOwnership should allow admin access even if not owner
            const verifiedEvent = await verifyEventOwnership(requestingUser, eventId);
            expect(verifiedEvent).toEqual(mockEvent);

          } else if (requestingUserId === eventOwnerId) {
            // Event owners should have access to their own events for all operations
            const hasAccess = await canAccessEvent(requestingUser, eventId, operation);
            
            if (operation === 'read') {
              // Owners can always read their own events
              expect(hasAccess).toBe(true);
            } else if (operation === 'update' || operation === 'delete' || operation === 'publish') {
              // Owners can modify their events if they have the right role
              if (requestingUserRole === 'organizer') {
                expect(hasAccess).toBe(true);
              } else {
                // Regular users cannot perform write operations even on their own events
                expect(hasAccess).toBe(false);
              }
            }

            // Test requireEventAccess
            if (hasAccess) {
              const event = await requireEventAccess(requestingUser, eventId, operation);
              expect(event).toEqual(mockEvent);
            } else {
              await expect(requireEventAccess(requestingUser, eventId, operation))
                .rejects
                .toThrow(AppError);
            }

            // Test verifyEventOwnership - should succeed for actual owners
            if (requestingUserRole === 'organizer') {
              const verifiedEvent = await verifyEventOwnership(requestingUser, eventId);
              expect(verifiedEvent).toEqual(mockEvent);
            } else {
              // Regular users cannot verify ownership even if they are the owner
              await expect(verifyEventOwnership(requestingUser, eventId))
                .rejects
                .toThrow(AppError);
            }

          } else {
            // Non-owners (and non-admin) should have limited access
            const hasAccess = await canAccessEvent(requestingUser, eventId, operation);
            
            if (operation === 'read') {
              // Non-owners can read public published events
              if (eventVisibility === 'public' && eventStatus === 'published') {
                expect(hasAccess).toBe(true);
              } else {
                expect(hasAccess).toBe(false);
              }
            } else {
              // Non-owners cannot perform write operations
              expect(hasAccess).toBe(false);
            }

            // Test requireEventAccess
            if (hasAccess) {
              const event = await requireEventAccess(requestingUser, eventId, operation);
              expect(event).toEqual(mockEvent);
            } else {
              await expect(requireEventAccess(requestingUser, eventId, operation))
                .rejects
                .toThrow(AppError);
            }

            // Test verifyEventOwnership - should fail for non-owners
            await expect(verifyEventOwnership(requestingUser, eventId))
              .rejects
              .toThrow(AppError);
          }

          // The core property we're testing:
          // For any event update attempt, the system should verify the requesting user 
          // is the event organizer (or admin) before allowing modifications
          // This verifies Requirements 9.2 (ownership verification for updates)
        }
      ),
      { numRuns: 5 }
    );
  });

  it('Property 11a: Event Not Found Authorization', async () => {
    // Feature: events-management-system, Property 11a: Event Not Found Authorization
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // non-existent eventId
        fc.constantFrom('organizer', 'admin', 'user') as fc.Arbitrary<UserRole>, // user role
        fc.constantFrom('read', 'update', 'delete', 'publish') as fc.Arbitrary<'read' | 'update' | 'delete' | 'publish'>, // operation
        async (eventId, userRole, operation) => {
          // Create mock JWT payload
          const user = createMockJWTPayload({
            role: userRole,
          });

          // Mock the event service to return null (event not found)
          const mockEventService = await import('../services/event.service');
          vi.mocked(mockEventService.eventService.findById).mockResolvedValue(null);

          // Test that all authorization functions properly handle non-existent events
          const hasAccess = await canAccessEvent(user, eventId, operation);
          expect(hasAccess).toBe(false);

          // requireEventAccess should throw NOT_FOUND error
          await expect(requireEventAccess(user, eventId, operation))
            .rejects
            .toThrow(AppError);

          try {
            await requireEventAccess(user, eventId, operation);
          } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).code).toBe(ErrorCode.NOT_FOUND);
          }

          // verifyEventOwnership should throw NOT_FOUND error
          await expect(verifyEventOwnership(user, eventId))
            .rejects
            .toThrow(AppError);

          try {
            await verifyEventOwnership(user, eventId);
          } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).code).toBe(ErrorCode.NOT_FOUND);
          }

          // The property we're testing:
          // For any non-existent event, authorization functions should consistently 
          // return false or throw NOT_FOUND errors, never grant access
        }
      ),
      { numRuns: 3 }
    );
  });

  it('Property 11b: Role-Based Operation Authorization', async () => {
    // Feature: events-management-system, Property 11b: Role-Based Operation Authorization
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // eventId
        fc.uuid(), // userId
        fc.constantFrom('organizer', 'admin', 'user') as fc.Arbitrary<UserRole>, // user role
        fc.constantFrom('draft', 'published', 'cancelled', 'completed') as fc.Arbitrary<EventStatus>, // event status
        fc.constantFrom('public', 'private', 'unlisted') as fc.Arbitrary<EventVisibility>, // event visibility
        async (eventId, userId, userRole, eventStatus, eventVisibility) => {
          // Create mock event owned by the user
          const mockEvent = createMockEvent({
            id: eventId,
            organizerId: userId,
            status: eventStatus,
            visibility: eventVisibility,
          });

          // Create mock JWT payload
          const user = createMockJWTPayload({
            userId,
            role: userRole,
          });

          // Mock the event service
          const mockEventService = await import('../services/event.service');
          vi.mocked(mockEventService.eventService.findById).mockResolvedValue(mockEvent);

          // Test role-based authorization for different operations
          const operations: Array<'read' | 'update' | 'delete' | 'publish'> = ['read', 'update', 'delete', 'publish'];
          
          for (const operation of operations) {
            const hasAccess = await canAccessEvent(user, eventId, operation);

            if (userRole === 'admin') {
              // Admin can perform any operation
              expect(hasAccess).toBe(true);
            } else if (userRole === 'organizer') {
              // Organizers can perform all operations on their own events
              expect(hasAccess).toBe(true);
            } else if (userRole === 'user') {
              if (operation === 'read') {
                // Users can read their own events or public published events
                expect(hasAccess).toBe(true);
              } else {
                // Users cannot perform write operations even on their own events
                expect(hasAccess).toBe(false);
              }
            }
          }

          // The property we're testing:
          // For any user role and operation combination, authorization should be 
          // consistent with the role-based permission system
          // Admin > Organizer > User in terms of permissions
        }
      ),
      { numRuns: 3 }
    );
  });

  it('Property 11c: Public Event Read Access', async () => {
    // Feature: events-management-system, Property 11c: Public Event Read Access
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // eventId
        fc.uuid(), // eventOwnerId
        fc.uuid(), // randomUserId (not the owner)
        fc.constantFrom('organizer', 'admin', 'user') as fc.Arbitrary<UserRole>, // random user role
        async (eventId, eventOwnerId, randomUserId, randomUserRole) => {
          // Ensure random user is not the owner
          fc.pre(randomUserId !== eventOwnerId);

          // Create a public published event
          const mockEvent = createMockEvent({
            id: eventId,
            organizerId: eventOwnerId,
            status: 'published' as EventStatus,
            visibility: 'public' as EventVisibility,
          });

          // Create mock JWT payload for random user
          const randomUser = createMockJWTPayload({
            userId: randomUserId,
            role: randomUserRole,
          });

          // Mock the event service
          const mockEventService = await import('../services/event.service');
          vi.mocked(mockEventService.eventService.findById).mockResolvedValue(mockEvent);

          // Test that any user can read public published events
          const hasReadAccess = await canAccessEvent(randomUser, eventId, 'read');
          expect(hasReadAccess).toBe(true);

          // requireEventAccess should succeed for read operations on public events
          const event = await requireEventAccess(randomUser, eventId, 'read');
          expect(event).toEqual(mockEvent);

          // But write operations should still be restricted to owners/admins
          const writeOperations: Array<'update' | 'delete' | 'publish'> = ['update', 'delete', 'publish'];
          
          for (const operation of writeOperations) {
            const hasWriteAccess = await canAccessEvent(randomUser, eventId, operation);
            
            if (randomUserRole === 'admin') {
              expect(hasWriteAccess).toBe(true);
            } else {
              expect(hasWriteAccess).toBe(false);
            }
          }

          // The property we're testing:
          // For any public published event, any user should have read access,
          // but write access should still be restricted to owners and admins
        }
      ),
      { numRuns: 3 }
    );
  });
});