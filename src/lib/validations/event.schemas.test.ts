import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
  createCategorySchema,
} from './event.schemas';

describe('Event Validation Schemas', () => {
  describe('createEventSchema', () => {
    it('should validate a complete valid event', () => {
      const validEvent = {
        title: 'Test Event',
        description: 'This is a test event description with enough characters',
        startDateTime: '2024-06-01T10:00:00Z',
        endDateTime: '2024-06-01T12:00:00Z',
        timezone: 'UTC',
        location: {
          type: 'virtual' as const,
          url: 'https://example.com/meeting',
          platform: 'Zoom',
        },
        images: {
          thumbnail: 'https://example.com/thumb.jpg',
          banner: 'https://example.com/banner.jpg',
        },
        visibility: 'public' as const,
      };

      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should reject event with end date before start date', () => {
      const invalidEvent = {
        title: 'Test Event',
        description: 'This is a test event description with enough characters',
        startDateTime: '2024-06-01T12:00:00Z',
        endDateTime: '2024-06-01T10:00:00Z', // Before start date
        timezone: 'UTC',
        location: {
          type: 'virtual' as const,
          url: 'https://example.com/meeting',
        },
        images: {
          thumbnail: 'https://example.com/thumb.jpg',
          banner: 'https://example.com/banner.jpg',
        },
      };

      const result = createEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('End date must be after start date');
      }
    });

    it('should reject event with title too short', () => {
      const invalidEvent = {
        title: 'Hi', // Too short
        description: 'This is a test event description with enough characters',
        startDateTime: '2024-06-01T10:00:00Z',
        endDateTime: '2024-06-01T12:00:00Z',
        timezone: 'UTC',
        location: {
          type: 'virtual' as const,
          url: 'https://example.com/meeting',
        },
        images: {
          thumbnail: 'https://example.com/thumb.jpg',
          banner: 'https://example.com/banner.jpg',
        },
      };

      const result = createEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title must be at least 3 characters');
      }
    });

    it('should validate physical location', () => {
      const eventWithPhysicalLocation = {
        title: 'Test Event',
        description: 'This is a test event description with enough characters',
        startDateTime: '2024-06-01T10:00:00Z',
        endDateTime: '2024-06-01T12:00:00Z',
        timezone: 'UTC',
        location: {
          type: 'physical' as const,
          address: '123 Main Street',
          city: 'New York',
          country: 'USA',
          coordinates: {
            lat: 40.7128,
            lng: -74.0060,
          },
        },
        images: {
          thumbnail: 'https://example.com/thumb.jpg',
          banner: 'https://example.com/banner.jpg',
        },
      };

      const result = createEventSchema.safeParse(eventWithPhysicalLocation);
      expect(result.success).toBe(true);
    });

    it('should validate event with price', () => {
      const eventWithPrice = {
        title: 'Test Event',
        description: 'This is a test event description with enough characters',
        startDateTime: '2024-06-01T10:00:00Z',
        endDateTime: '2024-06-01T12:00:00Z',
        timezone: 'UTC',
        location: {
          type: 'virtual' as const,
          url: 'https://example.com/meeting',
        },
        images: {
          thumbnail: 'https://example.com/thumb.jpg',
          banner: 'https://example.com/banner.jpg',
        },
        price: {
          amount: 25.99,
          currency: 'USD',
          type: 'paid' as const,
        },
      };

      const result = createEventSchema.safeParse(eventWithPrice);
      expect(result.success).toBe(true);
    });
  });

  describe('eventQuerySchema', () => {
    it('should validate query parameters with defaults', () => {
      const query = {};
      const result = eventQuerySchema.safeParse(query);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should validate query with date range', () => {
      const query = {
        fromDate: '2024-06-01T00:00:00Z',
        toDate: '2024-06-30T23:59:59Z',
        status: 'published',
        search: 'conference',
      };

      const result = eventQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date range', () => {
      const query = {
        fromDate: '2024-06-30T00:00:00Z',
        toDate: '2024-06-01T23:59:59Z', // Before from date
      };

      const result = eventQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('To date must be after or equal to from date');
      }
    });
  });

  describe('createCategorySchema', () => {
    it('should validate a valid category', () => {
      const validCategory = {
        name: 'Technology',
        slug: 'technology',
        color: '#FF0000',
        icon: 'tech-icon',
      };

      const result = createCategorySchema.safeParse(validCategory);
      expect(result.success).toBe(true);
    });

    it('should reject invalid slug format', () => {
      const invalidCategory = {
        name: 'Technology',
        slug: 'Technology With Spaces', // Invalid slug
      };

      const result = createCategorySchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Slug must contain only lowercase letters, numbers, and hyphens');
      }
    });

    it('should reject invalid color format', () => {
      const invalidCategory = {
        name: 'Technology',
        slug: 'technology',
        color: 'red', // Invalid hex color
      };

      const result = createCategorySchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Color must be a valid hex color code');
      }
    });
  });

  describe('Property-Based Tests', () => {
    it('Property 10: Date Validation Logic', async () => {
      // Feature: events-management-system, Property 10: Date Validation Logic
      await fc.assert(
        fc.asyncProperty(
          // Generate two dates where end date is not after start date
          fc.date({ min: new Date('2024-01-01'), max: new Date('2030-12-31') }),
          fc.date({ min: new Date('2024-01-01'), max: new Date('2030-12-31') }),
          async (date1, date2) => {
            // Ensure we have invalid date order (end <= start)
            const startDateTime = date1 > date2 ? date1 : date2;
            const endDateTime = date1 > date2 ? date2 : date1;
            
            // Skip if dates are valid (end > start)
            fc.pre(endDateTime <= startDateTime);

            // Create minimal valid event data with invalid dates
            const eventData = {
              title: 'Test Event',
              description: 'This is a test event description with enough characters',
              startDateTime: startDateTime.toISOString(),
              endDateTime: endDateTime.toISOString(),
              timezone: 'UTC',
              location: {
                type: 'virtual' as const,
                url: 'https://example.com/meeting',
              },
              images: {
                thumbnail: 'https://example.com/thumb.jpg',
                banner: 'https://example.com/banner.jpg',
              },
              visibility: 'public' as const,
            };

            const result = createEventSchema.safeParse(eventData);
            
            // The schema should reject events where end date is not after start date
            expect(result.success).toBe(false);
            if (!result.success) {
              // Look for the date validation error in any of the issues
              const hasDateError = result.error.issues.some(
                issue => issue.message === 'End date must be after start date'
              );
              expect(hasDateError).toBe(true);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});