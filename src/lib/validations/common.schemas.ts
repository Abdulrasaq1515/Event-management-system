import { z } from 'zod';

// Common field validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email must be at most 254 characters');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const urlSchema = z.string()
  .url('Invalid URL format')
  .max(2048, 'URL must be at most 2048 characters');

export const colorHexSchema = z.string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code (e.g., #FF0000)');

export const timezoneSchema = z.string()
  .min(1, 'Timezone is required')
  .refine(
    (tz) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    },
    'Invalid timezone'
  );

export const currencySchema = z.string()
  .length(3, 'Currency code must be exactly 3 characters')
  .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters (e.g., USD, EUR)');

export const coordinatesSchema = z.object({
  lat: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

// Date and time validation schemas
export const dateStringSchema = z.string()
  .datetime('Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)');

export const futureDateSchema = z.string()
  .datetime('Invalid date format')
  .refine(
    (date) => new Date(date) > new Date(),
    'Date must be in the future'
  );

export const pastDateSchema = z.string()
  .datetime('Invalid date format')
  .refine(
    (date) => new Date(date) < new Date(),
    'Date must be in the past'
  );

export const dateRangeSchema = z.object({
  startDate: dateStringSchema,
  endDate: dateStringSchema,
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

// Text validation schemas
export const titleSchema = z.string()
  .min(3, 'Title must be at least 3 characters')
  .max(200, 'Title must be at most 200 characters')
  .trim();

export const descriptionSchema = z.string()
  .min(10, 'Description must be at least 10 characters')
  .max(5000, 'Description must be at most 5000 characters')
  .trim();

export const excerptSchema = z.string()
  .max(300, 'Excerpt must be at most 300 characters')
  .trim()
  .optional();

export const slugSchema = z.string()
  .min(1, 'Slug cannot be empty')
  .max(200, 'Slug must be at most 200 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .refine(
    (slug) => !slug.startsWith('-') && !slug.endsWith('-'),
    'Slug cannot start or end with a hyphen'
  );

// Numeric validation schemas
export const positiveIntegerSchema = z.number()
  .int('Must be an integer')
  .positive('Must be a positive number');

export const nonNegativeIntegerSchema = z.number()
  .int('Must be an integer')
  .min(0, 'Must be non-negative');

export const capacitySchema = z.number()
  .int('Capacity must be an integer')
  .positive('Capacity must be a positive number')
  .max(1000000, 'Capacity cannot exceed 1,000,000');

export const priceAmountSchema = z.number()
  .min(0, 'Price must be non-negative')
  .max(999999.99, 'Price cannot exceed 999,999.99');

// File and media validation schemas
export const imageUrlSchema = z.string()
  .url('Must be a valid URL')
  .refine(
    (url) => {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
      const urlLower = url.toLowerCase();
      return imageExtensions.some(ext => urlLower.includes(ext)) || 
             urlLower.includes('image') || 
             urlLower.includes('photo') ||
             urlLower.includes('picture');
    },
    'URL must point to an image file'
  );

export const videoUrlSchema = z.string()
  .url('Must be a valid URL')
  .refine(
    (url) => {
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
      const urlLower = url.toLowerCase();
      return videoExtensions.some(ext => urlLower.includes(ext)) || 
             urlLower.includes('video') ||
             urlLower.includes('youtube.com') ||
             urlLower.includes('vimeo.com');
    },
    'URL must point to a video file or streaming service'
  );

// Social media and external service validation
export const socialMediaUrlSchema = z.string()
  .url('Must be a valid URL')
  .refine(
    (url) => {
      const socialDomains = [
        'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 
        'linkedin.com', 'youtube.com', 'tiktok.com', 'discord.gg'
      ];
      return socialDomains.some(domain => url.toLowerCase().includes(domain));
    },
    'Must be a valid social media URL'
  );

// Blockchain and Web3 validation schemas
export const solanaAddressSchema = z.string()
  .min(32, 'Solana address must be at least 32 characters')
  .max(44, 'Solana address must be at most 44 characters')
  .regex(/^[1-9A-HJ-NP-Za-km-z]+$/, 'Invalid Solana address format');

export const ethereumAddressSchema = z.string()
  .length(42, 'Ethereum address must be exactly 42 characters')
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format');

// Search and filtering schemas
export const searchQuerySchema = z.string()
  .min(1, 'Search query cannot be empty')
  .max(100, 'Search query must be at most 100 characters')
  .trim();

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

export const sortFieldSchema = z.enum([
  'createdAt', 'updatedAt', 'startDateTime', 'endDateTime', 
  'title', 'capacity', 'currentAttendees'
]).default('createdAt');

// Validation helper functions
export const createOptionalSchema = <T extends z.ZodTypeAny>(schema: T) => 
  schema.optional().or(z.literal('').transform(() => undefined));

export const createNullableSchema = <T extends z.ZodTypeAny>(schema: T) => 
  schema.nullable().or(z.literal('').transform(() => null));

// Type exports
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
export type SortField = z.infer<typeof sortFieldSchema>;