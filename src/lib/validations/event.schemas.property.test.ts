import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { 
  createEventSchema, 
  updateEventSchema, 
  eventQuerySchema,
  type CreateEventInput,
  type UpdateEventInput,
  type EventQueryInput
} from './event.schemas';

// Safety helper for Date -> ISO string mapping to avoid RangeError on invalid dates
const toISOStringSafe = (d: Date) => (isNaN(d.getTime()) ? 'invalid-date' : d.toISOString());

// Helper function to create valid base event data
function createValidEventBase(): Omit<CreateEventInput, 'startDateTime' | 'endDateTime'> {
  return {
    title: 'Test Event',
    description: 'This is a test event description that meets minimum length requirements',
    timezone: 'UTC',
    location: { type: 'virtual', url: 'https://example.com' },
    images: { 
      thumbnail: 'https://example.com/thumb.jpg', 
      banner: 'https://example.com/banner.jpg' 
    },
  };
}

describe('Date Validation Logic Property Tests', () => {
  it('Property 10: Date Validation Logic', async () => {
    // Feature: events-management-system, Property 10: Date Validation Logic
    await fc.assert(
      fc.asyncProperty(
        // Generate pairs of dates where endDateTime is NOT after startDateTime
        fc.record({
          startDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
        }).filter(dates => dates.endDateTime <= dates.startDateTime), // Invalid: end <= start
        async (invalidDates) => {
          const eventData = {
            ...createValidEventBase(),
            startDateTime: toISOStringSafe(invalidDates.startDateTime),
            endDateTime: toISOStringSafe(invalidDates.endDateTime),
          };

          // Test createEventSchema validation
          const createResult = createEventSchema.safeParse(eventData);
          expect(createResult.success).toBe(false);
          
          if (!createResult.success && createResult.error?.errors) {
            const endDateError = createResult.error.errors.find(
              err => err.path.includes('endDateTime')
            );
            expect(endDateError).toBeDefined();
            expect(endDateError?.message).toBe('End date must be after start date');
          }

          // Test updateEventSchema validation (when both dates are provided)
          const updateResult = updateEventSchema.safeParse(eventData);
          expect(updateResult.success).toBe(false);
          
          if (!updateResult.success && updateResult.error?.errors) {
            const endDateError = updateResult.error.errors.find(
              err => err.path.includes('endDateTime')
            );
            expect(endDateError).toBeDefined();
            expect(endDateError?.message).toBe('End date must be after start date');
          }
        }
      ),
      { numRuns: 5 }
    );
  });

  it('Property 10a: Valid Date Validation Logic', async () => {
    // Feature: events-management-system, Property 10a: Valid Date Validation Logic
    await fc.assert(
      fc.asyncProperty(
        // Generate pairs of dates where endDateTime IS after startDateTime
        fc.record({
          startDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-06-01') }),
          endDateTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
        }).filter(dates => dates.endDateTime > dates.startDateTime), // Valid: end > start
        async (validDates) => {
          const eventData = {
            ...createValidEventBase(),
            startDateTime: toISOStringSafe(validDates.startDateTime),
            endDateTime: toISOStringSafe(validDates.endDateTime),
          };

          // Test createEventSchema validation - should pass
          const createResult = createEventSchema.safeParse(eventData);
          expect(createResult.success).toBe(true);

          // Test updateEventSchema validation - should pass
          const updateResult = updateEventSchema.safeParse(eventData);
          expect(updateResult.success).toBe(true);
        }
      ),
      { numRuns: 5 }
    );
  });

  it('Property 10b: Query Date Range Validation Logic', async () => {
    // Feature: events-management-system, Property 10b: Query Date Range Validation Logic
    await fc.assert(
      fc.asyncProperty(
        // Generate pairs of dates where toDate is BEFORE fromDate
        fc.record({
          fromDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          toDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
        }).filter(dates => dates.toDate < dates.fromDate), // Invalid: to < from
        async (invalidDates) => {
          const queryData = {
            fromDate: toISOStringSafe(invalidDates.fromDate),
            toDate: toISOStringSafe(invalidDates.toDate),
          };

          // Test eventQuerySchema validation
          const queryResult = eventQuerySchema.safeParse(queryData);
          expect(queryResult.success).toBe(false);
          
          if (!queryResult.success && queryResult.error?.errors) {
            const toDateError = queryResult.error.errors.find(
              err => err.path.includes('toDate')
            );
            expect(toDateError).toBeDefined();
            expect(toDateError?.message).toBe('To date must be after or equal to from date');
          }
        }
      ),
      { numRuns: 5 }
    );
  });

  it('Property 10c: Valid Query Date Range Validation Logic', async () => {
    // Feature: events-management-system, Property 10c: Valid Query Date Range Validation Logic
    await fc.assert(
      fc.asyncProperty(
        // Generate pairs of dates where toDate is after or equal to fromDate
        fc.record({
          fromDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-06-01') }),
          toDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
        }).filter(dates => dates.toDate >= dates.fromDate), // Valid: to >= from
        async (validDates) => {
          const queryData = {
            fromDate: toISOStringSafe(validDates.fromDate),
            toDate: toISOStringSafe(validDates.toDate),
          };

          // Test eventQuerySchema validation - should pass
          const queryResult = eventQuerySchema.safeParse(queryData);
          expect(queryResult.success).toBe(true);
        }
      ),
      { numRuns: 5 }
    );
  });

  it('Property 10d: Partial Update Date Validation Logic', async () => {
    // Feature: events-management-system, Property 10d: Partial Update Date Validation Logic
    await fc.assert(
      fc.asyncProperty(
        // Test that partial updates work correctly when only one date is provided
        fc.oneof(
          // Only startDateTime provided (use native toISOString to avoid 'invalid-date' sentinel)
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
            .map(date => ({ startDateTime: date.toISOString() })),
          // Only endDateTime provided (use native toISOString to avoid 'invalid-date' sentinel)
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
            .map(date => ({ endDateTime: date.toISOString() })),
          // Empty update
          fc.constant({})
        ),
        async (partialUpdateData) => {
          // Test updateEventSchema validation with partial data - should pass
          const updateResult = updateEventSchema.safeParse(partialUpdateData);
          expect(updateResult.success).toBe(true);
        }
      ),
      { numRuns: 5 }
    );
  });

  it('Property 10e: Invalid Date Format Validation Logic', async () => {
    // Feature: events-management-system, Property 10e: Invalid Date Format Validation Logic
    await fc.assert(
      fc.asyncProperty(
        // Generate invalid date strings
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => 
            s !== '' && 
            !s.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) &&
            s !== 'invalid-date' // Exclude this specific case that might cause issues
          ),
          fc.constant('2024-13-45T25:70:80Z'), // Invalid date components
          fc.constant('2024-01-01'), // Missing time component
          fc.constant('2024-01-01 10:00:00'), // Wrong format (space instead of T)
          fc.constant('not-a-date-at-all'),
        ),
        async (invalidDateString) => {
          const eventData = {
            ...createValidEventBase(),
            startDateTime: invalidDateString,
            endDateTime: new Date('2025-01-01T12:00:00Z').toISOString(),
          };

          // Test createEventSchema validation
          const createResult = createEventSchema.safeParse(eventData);
          expect(createResult.success).toBe(false);
          
          if (!createResult.success && createResult.error?.errors) {
            const startDateError = createResult.error.errors.find(
              err => err.path.includes('startDateTime')
            );
            expect(startDateError).toBeDefined();
            expect(startDateError?.message).toContain('Invalid');
          }
        }
      ),
      { numRuns: 3 }
    );
  });
});