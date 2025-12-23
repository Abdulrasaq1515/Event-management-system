import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  urlSchema,
  colorHexSchema,
  timezoneSchema,
  currencySchema,
  coordinatesSchema,
  dateRangeSchema,
  titleSchema,
  slugSchema,
  capacitySchema,
  priceAmountSchema,
  imageUrlSchema,
  solanaAddressSchema,
  searchQuerySchema,
} from './common.schemas';

describe('Common Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      validEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
      ];

      invalidEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('urlSchema', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://subdomain.example.com/path?query=value',
      ];

      validUrls.forEach(url => {
        const result = urlSchema.safeParse(url);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'example.com', // Missing protocol
      ];

      invalidUrls.forEach(url => {
        const result = urlSchema.safeParse(url);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('colorHexSchema', () => {
    it('should validate correct hex colors', () => {
      const validColors = ['#FF0000', '#00ff00', '#0000FF', '#123ABC'];

      validColors.forEach(color => {
        const result = colorHexSchema.safeParse(color);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid hex colors', () => {
      const invalidColors = ['red', '#FF', '#GGGGGG', 'FF0000'];

      invalidColors.forEach(color => {
        const result = colorHexSchema.safeParse(color);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('timezoneSchema', () => {
    it('should validate correct timezones', () => {
      const validTimezones = [
        'UTC',
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
      ];

      validTimezones.forEach(tz => {
        const result = timezoneSchema.safeParse(tz);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid timezones', () => {
      const invalidTimezones = [
        '',
        'Invalid/Timezone',
        'GMT+5', // Not IANA format
      ];

      invalidTimezones.forEach(tz => {
        const result = timezoneSchema.safeParse(tz);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('currencySchema', () => {
    it('should validate correct currency codes', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];

      validCurrencies.forEach(currency => {
        const result = currencySchema.safeParse(currency);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid currency codes', () => {
      const invalidCurrencies = ['usd', 'US', 'DOLLAR', '123'];

      invalidCurrencies.forEach(currency => {
        const result = currencySchema.safeParse(currency);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('coordinatesSchema', () => {
    it('should validate correct coordinates', () => {
      const validCoordinates = [
        { lat: 40.7128, lng: -74.0060 }, // New York
        { lat: 0, lng: 0 }, // Null Island
        { lat: -90, lng: 180 }, // Extreme values
      ];

      validCoordinates.forEach(coords => {
        const result = coordinatesSchema.safeParse(coords);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid coordinates', () => {
      const invalidCoordinates = [
        { lat: 91, lng: 0 }, // Latitude out of range
        { lat: 0, lng: 181 }, // Longitude out of range
        { lat: -91, lng: -181 }, // Both out of range
      ];

      invalidCoordinates.forEach(coords => {
        const result = coordinatesSchema.safeParse(coords);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('dateRangeSchema', () => {
    it('should validate correct date ranges', () => {
      const validRange = {
        startDate: '2024-06-01T10:00:00Z',
        endDate: '2024-06-01T12:00:00Z',
      };

      const result = dateRangeSchema.safeParse(validRange);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      const invalidRange = {
        startDate: '2024-06-01T12:00:00Z',
        endDate: '2024-06-01T10:00:00Z', // End before start
      };

      const result = dateRangeSchema.safeParse(invalidRange);
      expect(result.success).toBe(false);
    });
  });

  describe('titleSchema', () => {
    it('should validate correct titles', () => {
      const validTitles = [
        'Short',
        'A reasonable length title',
        'A'.repeat(200), // Max length
      ];

      validTitles.forEach(title => {
        const result = titleSchema.safeParse(title);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid titles', () => {
      const invalidTitles = [
        'Hi', // Too short
        'A'.repeat(201), // Too long
        '  ', // Only whitespace
      ];

      invalidTitles.forEach(title => {
        const result = titleSchema.safeParse(title);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('slugSchema', () => {
    it('should validate correct slugs', () => {
      const validSlugs = [
        'valid-slug',
        'slug123',
        'a-very-long-slug-with-many-words',
      ];

      validSlugs.forEach(slug => {
        const result = slugSchema.safeParse(slug);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid slugs', () => {
      const invalidSlugs = [
        'Invalid Slug', // Contains spaces
        'slug_with_underscores', // Contains underscores
        '-starts-with-hyphen',
        'ends-with-hyphen-',
        'UPPERCASE',
      ];

      invalidSlugs.forEach(slug => {
        const result = slugSchema.safeParse(slug);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('capacitySchema', () => {
    it('should validate correct capacities', () => {
      const validCapacities = [1, 100, 1000, 999999];

      validCapacities.forEach(capacity => {
        const result = capacitySchema.safeParse(capacity);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid capacities', () => {
      const invalidCapacities = [0, -1, 1.5, 1000001];

      invalidCapacities.forEach(capacity => {
        const result = capacitySchema.safeParse(capacity);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('priceAmountSchema', () => {
    it('should validate correct price amounts', () => {
      const validAmounts = [0, 0.01, 25.99, 999999.99];

      validAmounts.forEach(amount => {
        const result = priceAmountSchema.safeParse(amount);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid price amounts', () => {
      const invalidAmounts = [-1, 1000000];

      invalidAmounts.forEach(amount => {
        const result = priceAmountSchema.safeParse(amount);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('imageUrlSchema', () => {
    it('should validate image URLs', () => {
      const validImageUrls = [
        'https://example.com/image.jpg',
        'https://example.com/photo.png',
        'https://example.com/picture.webp',
        'https://example.com/api/image/123',
      ];

      validImageUrls.forEach(url => {
        const result = imageUrlSchema.safeParse(url);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('searchQuerySchema', () => {
    it('should validate search queries', () => {
      const validQueries = [
        'conference',
        'tech meetup',
        'a'.repeat(100), // Max length
      ];

      validQueries.forEach(query => {
        const result = searchQuerySchema.safeParse(query);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid search queries', () => {
      const invalidQueries = [
        'a'.repeat(101), // Too long
      ];

      invalidQueries.forEach(query => {
        const result = searchQuerySchema.safeParse(query);
        expect(result.success).toBe(false);
      });
    });
  });
});