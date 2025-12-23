import { 
  mysqlTable, 
  varchar, 
  text, 
  timestamp, 
  int, 
  json, 
  mysqlEnum, 
  index
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

// Events table with comprehensive schema and indexing
export const events = mysqlTable('events', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  excerpt: varchar('excerpt', { length: 300 }),
  startDateTime: timestamp('start_datetime').notNull(),
  endDateTime: timestamp('end_datetime').notNull(),
  timezone: varchar('timezone', { length: 50 }).notNull(),
  location: json('location').notNull(),
  capacity: int('capacity'),
  currentAttendees: int('current_attendees').default(0),
  status: mysqlEnum('status', [
    'draft', 
    'published', 
    'cancelled', 
    'completed', 
    'archived'
  ]).default('draft'),
  visibility: mysqlEnum('visibility', [
    'public', 
    'private', 
    'unlisted'
  ]).default('public'),
  organizerId: varchar('organizer_id', { length: 36 }).notNull(),
  categoryId: varchar('category_id', { length: 36 }),
  price: json('price'),
  images: json('images').notNull(),
  metadata: json('metadata').default(sql`(JSON_OBJECT())`),
  version: int('version').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  publishedAt: timestamp('published_at'),
}, (table) => ({
  // Performance-optimized indexes based on common query patterns
  slugIdx: index('idx_slug').on(table.slug),
  statusStartIdx: index('idx_status_start').on(table.status, table.startDateTime),
  organizerCreatedIdx: index('idx_organizer_created').on(table.organizerId, table.createdAt),
  categoryStatusIdx: index('idx_category_status').on(table.categoryId, table.status),
  visibilityIdx: index('idx_visibility').on(table.visibility),
  startDateTimeIdx: index('idx_start_datetime').on(table.startDateTime),
  endDateTimeIdx: index('idx_end_datetime').on(table.endDateTime),
}));

// Categories table for event organization
export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  color: varchar('color', { length: 7 }), // Hex color code
  icon: varchar('icon', { length: 50 }), // Icon name or class
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  slugIdx: index('idx_category_slug').on(table.slug),
  nameIdx: index('idx_category_name').on(table.name),
}));

// Type exports for use in services and API routes
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

// Event status and visibility types
export type EventStatus = Event['status'];
export type EventVisibility = Event['visibility'];