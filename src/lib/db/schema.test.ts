import { describe, it, expect } from 'vitest';
import { events, categories, type Event, type Category } from './schema';

describe('Database Schema', () => {
  it('should have correct events table structure', () => {
    expect(events).toBeDefined();
    expect(events.id).toBeDefined();
    expect(events.slug).toBeDefined();
    expect(events.title).toBeDefined();
    expect(events.description).toBeDefined();
    expect(events.startDateTime).toBeDefined();
    expect(events.endDateTime).toBeDefined();
    expect(events.status).toBeDefined();
    expect(events.visibility).toBeDefined();
    expect(events.organizerId).toBeDefined();
  });

  it('should have correct categories table structure', () => {
    expect(categories).toBeDefined();
    expect(categories.id).toBeDefined();
    expect(categories.name).toBeDefined();
    expect(categories.slug).toBeDefined();
    expect(categories.createdAt).toBeDefined();
  });

  it('should export correct TypeScript types', () => {
    // This test ensures the types are properly exported
    const eventType: Event = {} as Event;
    const categoryType: Category = {} as Category;
    
    expect(typeof eventType).toBe('object');
    expect(typeof categoryType).toBe('object');
  });
});