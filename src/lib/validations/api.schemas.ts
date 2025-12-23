import { z } from 'zod';

// Generic API response schemas
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string(),
  details: z.unknown().optional(),
});

export const apiResponseSchema = z.union([successResponseSchema, errorResponseSchema]);

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const paginatedResponseSchema = z.object({
  data: z.array(z.unknown()),
  pagination: paginationSchema,
});

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const slugSchema = z.string()
  .min(1, 'Slug cannot be empty')
  .max(200, 'Slug must be at most 200 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

export const timestampSchema = z.string().datetime('Invalid timestamp format');

// File upload validation
export const imageUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Must be a valid file' }),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
}).refine(
  (data) => data.file.size <= data.maxSize,
  {
    message: 'File size exceeds maximum allowed size',
    path: ['file'],
  }
).refine(
  (data) => data.allowedTypes.includes(data.file.type),
  {
    message: 'File type not allowed',
    path: ['file'],
  }
);

// Authentication and authorization schemas
export const authTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  type: z.enum(['Bearer', 'API-Key']).default('Bearer'),
});

export const userContextSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  email: z.string().email('Invalid email format').optional(),
  role: z.enum(['organizer', 'admin', 'user']).default('user'),
  permissions: z.array(z.string()).default([]),
});

// Request validation schemas
export const createEventRequestSchema = z.object({
  body: z.unknown(),
  headers: z.record(z.string(), z.string()),
  query: z.record(z.string(), z.string().or(z.array(z.string()))),
});

export const updateEventRequestSchema = z.object({
  body: z.unknown(),
  headers: z.record(z.string(), z.string()),
  query: z.record(z.string(), z.string().or(z.array(z.string()))),
  params: z.object({
    id: uuidSchema,
  }),
});

export const deleteEventRequestSchema = z.object({
  headers: z.record(z.string(), z.string()),
  params: z.object({
    id: uuidSchema,
  }),
});

export const getEventRequestSchema = z.object({
  headers: z.record(z.string(), z.string()),
  params: z.object({
    id: uuidSchema,
  }),
});

export const listEventsRequestSchema = z.object({
  headers: z.record(z.string(), z.string()),
  query: z.record(z.string(), z.string().or(z.array(z.string()))),
});

// Type exports
export type SuccessResponse<T = unknown> = z.infer<typeof successResponseSchema> & { data: T };
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;
export type PaginatedResponse<T = unknown> = z.infer<typeof paginatedResponseSchema> & { data: T[] };
export type UserContext = z.infer<typeof userContextSchema>;
export type AuthToken = z.infer<typeof authTokenSchema>;