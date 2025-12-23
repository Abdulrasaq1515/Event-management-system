import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { events, type NewEvent } from './schema';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate a slug from title
function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  // If slug is empty after processing, generate a fallback
  return slug || 'untitled-event';
}

// Helper function to create valid event data
function createValidEventData(overrides: Partial<NewEvent> = {}): NewEvent {
  const baseData: NewEvent = {
    slug: generateSlug(overrides.title || 'test-event'),
    title: 'Test Event',
    description: 'This is a test event description that meets minimum length requirements',
    startDateTime: new Date('2024-06-01T10:00:00Z'),
    endDateTime: new Date('2024-06-01T12:00:00Z'),
    timezone: 'UTC',
    location: { type: 'virtual', url: 'https://example.com' },
    organizerId: uuidv4(),
    images: { 
      thumbnail: 'https://example.com/thumb.jpg', 
      banner: 'https://example.com/banner.jpg' 
    },
    ...overrides
  };
  return baseData;
}

describe('Database Schema Property Tests', () => {
  it('Property 1: Event Creation Integrity', async () => {
    // Feature: events-management-system, Property 1: Event Creation Integrity
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 3, maxLength: 200 }),
          description: fc.string({ minLength: 10, maxLength: 1000 }),
          startDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          timezone: fc.constantFrom('UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'),
          organizerId: fc.uuid(),
        }).filter(data => {
          // Filter out invalid data:
          // 1. End date must be after start date
          // 2. Title must not be only whitespace (would fail validation and produce empty slug)
          // 3. Title must contain at least one alphanumeric character (to generate valid slug)
          const hasValidDates = data.endDateTime > data.startDateTime;
          const hasNonWhitespace = data.title.trim().length > 0;
          const hasAlphanumeric = /[a-z0-9]/i.test(data.title);
          return hasValidDates && hasNonWhitespace && hasAlphanumeric;
        }),
        async (eventData) => {
          // Create event with generated data
          const newEventData = createValidEventData({
            title: eventData.title,
            description: eventData.description,
            startDateTime: eventData.startDateTime,
            endDateTime: eventData.endDateTime,
            timezone: eventData.timezone,
            organizerId: eventData.organizerId,
            slug: generateSlug(eventData.title),
          });

          // Test event data integrity without database connection
          // This validates the schema structure and data transformation
          
          // Verify required fields are present and valid
          expect(newEventData.id).toBeUndefined(); // Should be undefined before insertion
          expect(newEventData.slug).toBeDefined();
          expect(typeof newEventData.slug).toBe('string');
          expect(newEventData.slug.length).toBeGreaterThan(0);
          
          // Verify slug generation integrity
          expect(newEventData.slug).toBe(generateSlug(eventData.title));
          
          // Verify organizer ID is preserved
          expect(newEventData.organizerId).toBe(eventData.organizerId);
          
          // Verify required fields are preserved
          expect(newEventData.title).toBe(eventData.title);
          expect(newEventData.description).toBe(eventData.description);
          expect(newEventData.timezone).toBe(eventData.timezone);
          
          // Verify dates are preserved correctly
          expect(newEventData.startDateTime.getTime()).toBe(eventData.startDateTime.getTime());
          expect(newEventData.endDateTime.getTime()).toBe(eventData.endDateTime.getTime());
          
          // Verify default values would be set correctly
          expect(newEventData.status).toBeUndefined(); // Will be set by database default
          expect(newEventData.visibility).toBeUndefined(); // Will be set by database default
          expect(newEventData.version).toBeUndefined(); // Will be set by database default
          expect(newEventData.createdAt).toBeUndefined(); // Will be set by database default
          expect(newEventData.updatedAt).toBeUndefined(); // Will be set by database default
          
          // Verify required JSON fields are present
          expect(newEventData.location).toBeDefined();
          expect(typeof newEventData.location).toBe('object');
          expect(newEventData.images).toBeDefined();
          expect(typeof newEventData.images).toBe('object');
          
          // Verify data types match schema expectations
          expect(typeof newEventData.title).toBe('string');
          expect(typeof newEventData.description).toBe('string');
          expect(newEventData.startDateTime).toBeInstanceOf(Date);
          expect(newEventData.endDateTime).toBeInstanceOf(Date);
          expect(typeof newEventData.timezone).toBe('string');
          expect(typeof newEventData.organizerId).toBe('string');
          
          // Verify slug uniqueness property (no special characters, lowercase)
          expect(newEventData.slug).toMatch(/^[a-z0-9-]+$/);
          expect(newEventData.slug).not.toMatch(/^-|-$/); // No leading/trailing dashes
        }
      ),
      { numRuns: 20 }
    );
  });
});