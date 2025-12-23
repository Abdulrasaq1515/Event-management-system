import { z } from 'zod';

// Location validation schemas
const physicalLocationSchema = z.object({
  type: z.literal('physical'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

const virtualLocationSchema = z.object({
  type: z.literal('virtual'),
  url: z.string().url('Must be a valid URL'),
  platform: z.string().optional(),
});

// Price validation schema
const eventPriceSchema = z.object({
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3 characters (e.g., USD, EUR)'),
  type: z.enum(['free', 'paid']),
});

// Images validation schema
const eventImagesSchema = z.object({
  thumbnail: z.string().url('Thumbnail must be a valid URL'),
  banner: z.string().url('Banner must be a valid URL'),
  gallery: z.array(z.string().url()).optional(),
});

// NFT metadata validation schema
const nftMetadataSchema = z.object({
  mintAddress: z.string().min(32, 'Invalid mint address'),
  collectionAddress: z.string().min(32, 'Invalid collection address').optional(),
  metadata: z.object({
    name: z.string().min(1, 'NFT name is required'),
    symbol: z.string().min(1, 'NFT symbol is required'),
    image: z.string().url('NFT image must be a valid URL'),
    attributes: z.array(z.object({
      trait_type: z.string(),
      value: z.string(),
    })).optional(),
  }),
});

// Main event creation schema
export const createEventSchema = z.object({
  // Trim fields before validating so whitespace-only values are rejected
  title: z.preprocess((val) => (typeof val === 'string' ? val.trim() : val), z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters')),
  description: z.preprocess((val) => (typeof val === 'string' ? val.trim() : val), z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be at most 5000 characters')),
  excerpt: z.string()
    .max(300, 'Excerpt must be at most 300 characters')
    .optional(),
  startDateTime: z.string().datetime('Invalid start date format'),
  endDateTime: z.string().datetime('Invalid end date format'),
  timezone: z.string().min(1, 'Timezone is required'),
  location: z.discriminatedUnion('type', [physicalLocationSchema, virtualLocationSchema]),
  capacity: z.number()
    .int('Capacity must be an integer')
    .positive('Capacity must be a positive integer')
    .optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  price: eventPriceSchema.optional(),
  images: eventImagesSchema,
  categoryId: z.string().uuid('Invalid category ID format').optional(),
  nftMetadata: nftMetadataSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
}).refine(
  (data) => new Date(data.endDateTime) > new Date(data.startDateTime),
  {
    message: 'End date must be after start date',
    path: ['endDateTime'],
  }
);

// Event update schema (all fields optional except for business rules)
export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['draft', 'published', 'cancelled', 'completed', 'archived']).optional(),
}).refine(
  (data) => {
    // Only validate date relationship if both dates are provided
    if (data.startDateTime && data.endDateTime) {
      return new Date(data.endDateTime) > new Date(data.startDateTime);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDateTime'],
  }
);

// Event query parameters schema with enhanced validation and sanitization
export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['draft', 'published', 'cancelled', 'completed', 'archived']).optional(),
  category: z.string().uuid('Invalid category ID format').optional(),
  fromDate: z.string().datetime('Invalid from date format').optional(),
  toDate: z.string().datetime('Invalid to date format').optional(),
  search: z.preprocess((val) => (typeof val === 'string' ? val.trim() : val), z.string()
    .min(1, 'Search query cannot be empty')
    .max(200, 'Search query too long')).optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
  // Additional filters for advanced search
  organizerId: z.string().uuid('Invalid organizer ID format').optional(),
  minCapacity: z.coerce.number().int().positive().optional(),
  maxCapacity: z.coerce.number().int().positive().optional(),
  priceType: z.enum(['free', 'paid']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  hasNFT: z.coerce.boolean().optional(),
  sortBy: z.enum(['startDate', 'createdAt', 'title', 'capacity']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
}).refine(
  (data) => {
    // Validate date range if both dates are provided
    if (data.fromDate && data.toDate) {
      return new Date(data.toDate) >= new Date(data.fromDate);
    }
    return true;
  },
  {
    message: 'To date must be after or equal to from date',
    path: ['toDate'],
  }
).refine(
  (data) => {
    // Validate capacity range if both are provided
    if (data.minCapacity && data.maxCapacity) {
      return data.maxCapacity >= data.minCapacity;
    }
    return true;
  },
  {
    message: 'Maximum capacity must be greater than or equal to minimum capacity',
    path: ['maxCapacity'],
  }
).refine(
  (data) => {
    // Validate price range if both are provided
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.maxPrice >= data.minPrice;
    }
    return true;
  },
  {
    message: 'Maximum price must be greater than or equal to minimum price',
    path: ['maxPrice'],
  }
);

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be at most 100 characters'),
  slug: z.string()
    .min(2, 'Category slug must be at least 2 characters')
    .max(100, 'Category slug must be at most 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code')
    .optional(),
  icon: z.string()
    .max(50, 'Icon name must be at most 50 characters')
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Type exports for use in other parts of the application
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;