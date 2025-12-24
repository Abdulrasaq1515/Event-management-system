import { eq, and, or, like, gte, lte, desc, count, sql } from 'drizzle-orm';
import { db } from '../db';
import { events, type Event, type NewEvent } from '../db/schema';
import { AppError, ErrorCode } from '../utils/error-handler';
import type { 
  CreateEventRequest, 
  UpdateEventRequest,
  PaginatedResponse 
} from '../../types/api.types';
import type { EventQueryParams } from '../../types/event.types';

export class EventService {
  /**
   * Create a new event
   */
  async create(data: CreateEventRequest, organizerId: string): Promise<Event> {
    try {
      const slug = this.generateSlug(data.title);
      
      // Check if slug already exists
      const existingEvent = await this.findBySlug(slug);
      if (existingEvent) {
        throw new AppError(
          ErrorCode.CONFLICT,
          'An event with this title already exists',
          409
        );
      }

      const eventData: NewEvent = {
        ...data,
        slug,
        organizerId,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
        currentAttendees: 0,
        version: 1,
      };

      await db.insert(events).values(eventData);
      
      // For MySQL/PlanetScale, we need to fetch the created event
      const createdEvent = await this.findBySlug(slug);
      if (!createdEvent) {
        throw new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to create event',
          500
        );
      }
      
      console.log(`✅ Event created: ${createdEvent.id} - ${createdEvent.title}`);
      return createdEvent;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error creating event:', error);
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to create event',
        500,
        error
      );
    }
  }

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<Event | null> {
    try {
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, id))
        .limit(1);
      
      return event || null;
    } catch (error) {
      console.error('Error finding event by ID:', error);
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to retrieve event',
        500,
        error
      );
    }
  }

  /**
   * Find event by slug
   */
  async findBySlug(slug: string): Promise<Event | null> {
    try {
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.slug, slug))
        .limit(1);
      
      return event || null;
    } catch (error) {
      console.error('Error finding event by slug:', error);
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to retrieve event',
        500,
        error
      );
    }
  }

  /**
   * Find multiple events with advanced filtering and pagination
   */
  async findMany(params: EventQueryParams): Promise<PaginatedResponse<Event>> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        category, 
        fromDate, 
        toDate, 
        search,
        visibility,
        organizerId,
        minCapacity,
        maxCapacity,
        priceType,
        minPrice,
        maxPrice,
        hasNFT,
        sortBy = 'startDate',
        sortOrder = 'asc'
      } = params;
      
      // Validate and sanitize pagination parameters
      const sanitizedPage = Math.max(1, page);
      const sanitizedLimit = Math.min(Math.max(1, limit), 100); // Cap at 100 items per page
      const offset = (sanitizedPage - 1) * sanitizedLimit;

      // Build filter conditions with proper indexing optimization
      const conditions = this.buildFilterConditions(params);

      // Build the where clause - ALL conditions must be satisfied (AND logic)
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Determine optimal ordering based on sortBy and sortOrder
      let orderBy;
      const isDescending = sortOrder === 'desc';
      
      switch (sortBy) {
        case 'createdAt':
          orderBy = isDescending ? [desc(events.createdAt)] : [events.createdAt];
          break;
        case 'title':
          orderBy = isDescending ? [desc(events.title)] : [events.title];
          break;
        case 'capacity':
          orderBy = isDescending ? [desc(events.capacity)] : [events.capacity];
          break;
        case 'startDate':
        default:
          orderBy = isDescending ? [desc(events.startDateTime)] : [events.startDateTime];
          break;
      }

      // Execute queries in parallel for better performance
      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(events)
          .where(whereClause)
          .limit(sanitizedLimit)
          .offset(offset)
          .orderBy(...orderBy),
        db
          .select({ count: count() })
          .from(events)
          .where(whereClause)
      ]);

      const total = totalResult[0].count;
      const totalPages = Math.ceil(total / sanitizedLimit);

      // Log query performance metrics
      const appliedFilters = Object.keys(params).filter(key => 
        params[key as keyof EventQueryParams] !== undefined && 
        key !== 'page' && 
        key !== 'limit'
      );
      
      console.log(`📊 Events query: ${data.length} results (${total} total) - Page ${sanitizedPage}/${totalPages}`);
      console.log(`🔍 Applied filters: ${appliedFilters.length > 0 ? appliedFilters.join(', ') : 'none'}`);

      return {
        data,
        pagination: {
          page: sanitizedPage,
          limit: sanitizedLimit,
          total,
          totalPages,
          hasNext: sanitizedPage < totalPages,
          hasPrev: sanitizedPage > 1,
        },
      };
    } catch (error) {
      console.error('Error finding events:', error);
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to retrieve events',
        500,
        error
      );
    }
  }

  /**
   * Find public events for website visitors (published and public only)
   */
  async findPublicEvents(params: Omit<EventQueryParams, 'status' | 'visibility'>): Promise<PaginatedResponse<Event>> {
    try {
      // Force status to published and visibility to public for public discovery
      const publicParams: EventQueryParams = {
        ...params,
        status: 'published',
        visibility: 'public',
      };

      return await this.findMany(publicParams);
    } catch (error) {
      console.error('Error finding public events:', error);
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to retrieve public events',
        500,
        error
      );
    }
  }

  /**
   * Find events by organizer with advanced filtering
   */
  async findByOrganizer(organizerId: string, params: EventQueryParams): Promise<PaginatedResponse<Event>> {
    try {
      // Add organizerId to params and use the main findMany method for consistency
      const organizerParams: EventQueryParams = {
        ...params,
        organizerId,
      };

      const result = await this.findMany(organizerParams);
      
      console.log(`👤 Organizer events query: ${result.data.length} results (${result.pagination.total} total) for organizer ${organizerId}`);
      
      return result;
    } catch (error) {
      console.error('Error finding organizer events:', error);
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to retrieve organizer events',
        500,
        error
      );
    }
  }

  /**
   * Update an existing event
   */
  async update(id: string, data: UpdateEventRequest, organizerId: string): Promise<Event> {
    try {
      // First verify the event exists and check ownership
      const existingEvent = await this.findById(id);
      if (!existingEvent) {
        throw new AppError(
          ErrorCode.NOT_FOUND,
          'Event not found',
          404
        );
      }

      // Verify ownership - this is the core authorization check for event updates
      if (existingEvent.organizerId !== organizerId) {
        throw new AppError(
          ErrorCode.FORBIDDEN,
          'You do not have permission to update this event',
          403
        );
      }

      // Prepare update data - only include fields that are being updated
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };

      // Add fields that are being updated
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.timezone !== undefined) updateData.timezone = data.timezone;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.capacity !== undefined) updateData.capacity = data.capacity;
      if (data.visibility !== undefined) updateData.visibility = data.visibility;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.images !== undefined) updateData.images = data.images;
      if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
      if (data.nftMetadata !== undefined) updateData.metadata = data.nftMetadata;
      if (data.status !== undefined) updateData.status = data.status;

      // Convert date strings to Date objects if provided
      if (data.startDateTime) {
        updateData.startDateTime = new Date(data.startDateTime);
      }
      if (data.endDateTime) {
        updateData.endDateTime = new Date(data.endDateTime);
      }

      // Update slug if title changed
      if (data.title && data.title !== existingEvent.title) {
        const newSlug = this.generateSlug(data.title);
        
        // Check if new slug conflicts with existing events (excluding current event)
        const conflictingEvent = await db
          .select()
          .from(events)
          .where(and(eq(events.slug, newSlug), sql`${events.id} != ${id}`))
          .limit(1);
          
        if (conflictingEvent.length > 0) {
          throw new AppError(
            ErrorCode.CONFLICT,
            'An event with this title already exists',
            409
          );
        }
        
        updateData.slug = newSlug;
      }

      // Set publishedAt timestamp if status is being changed to published
      if (data.status === 'published' && existingEvent.status !== 'published') {
        updateData.publishedAt = new Date();
      }

      // Update the event and increment version
      await db
        .update(events)
        .set({
          ...updateData,
          version: sql`${events.version} + 1`
        })
        .where(eq(events.id, id));

      // Fetch the updated event
      const updatedEvent = await this.findById(id);
      if (!updatedEvent) {
        throw new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to update event',
          500
        );
      }

      console.log(`✅ Event updated: ${updatedEvent.id} - ${updatedEvent.title} (v${updatedEvent.version})`);
      return updatedEvent;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error updating event:', error);
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to update event',
        500,
        error
      );
    }
  }

  /**
   * Soft delete (archive) an event
   */
  async delete(id: string, organizerId: string): Promise<void> {
    try {
      // First verify the event exists and check ownership
      const existingEvent = await this.findById(id);
      if (!existingEvent) {
        throw new AppError(
          ErrorCode.NOT_FOUND,
          'Event not found',
          404
        );
      }

      // Verify ownership - this is the core authorization check for event deletion
      if (existingEvent.organizerId !== organizerId) {
        throw new AppError(
          ErrorCode.FORBIDDEN,
          'You do not have permission to delete this event',
          403
        );
      }

      // Soft delete by setting status to archived
      await db
        .update(events)
        .set({ 
          status: 'archived',
          updatedAt: new Date(),
        })
        .where(eq(events.id, id));

      console.log(`✅ Event archived: ${existingEvent.id} - ${existingEvent.title}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error archiving event:', error);
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to archive event',
        500,
        error
      );
    }
  }

  /**
   * Check if user owns the event
   */
  async verifyOwnership(eventId: string, organizerId: string): Promise<boolean> {
    try {
      const event = await this.findById(eventId);
      return event?.organizerId === organizerId;
    } catch (error) {
      console.error('Error verifying event ownership:', error);
      return false;
    }
  }

  /**
   * Verify event access with role-based authorization
   * This method provides centralized authorization logic for event operations
   */
  async verifyEventAccess(
    eventId: string, 
    userId: string, 
    userRole: 'user' | 'organizer' | 'admin',
    operation: 'read' | 'update' | 'delete' | 'publish'
  ): Promise<Event> {
    try {
      console.log(`🔐 verifyEventAccess: eventId=${eventId}, userId=${userId}, role=${userRole}, operation=${operation}`);
      
      const event = await this.findById(eventId);
      
      if (!event) {
        console.log(`❌ Event ${eventId} not found in database`);
        throw new AppError(
          ErrorCode.NOT_FOUND,
          'Event not found',
          404
        );
      }
      
      console.log(`📄 Event found: id=${event.id}, organizerId=${event.organizerId}, status=${event.status}, visibility=${event.visibility}`);

      // Admin users can perform any operation on any event
      if (userRole === 'admin') {
        console.log(`✅ Admin access granted for ${operation} operation on event ${eventId} by user ${userId}`);
        return event;
      }

      // For read operations, check visibility and status
      if (operation === 'read') {
        // Public published events can be read by anyone
        if (event.visibility === 'public' && event.status === 'published') {
          console.log(`✅ Public read access granted for event ${eventId}`);
          return event;
        }
        
        // Event owners can read their own events regardless of status/visibility
        if (event.organizerId === userId) {
          console.log(`✅ Owner read access granted for event ${eventId} by user ${userId}`);
          return event;
        }
        
        // Otherwise, access denied
        console.log(`❌ Read access denied for event ${eventId} by user ${userId} (role: ${userRole})`);
        throw new AppError(
          ErrorCode.FORBIDDEN,
          `You do not have permission to read this event`,
          403
        );
      }

      // For write operations (update, delete, publish), verify ownership
      if (operation === 'update' || operation === 'delete' || operation === 'publish') {
        // Only event owners can modify their events (unless admin)
        if (event.organizerId !== userId) {
          throw new AppError(
            ErrorCode.FORBIDDEN,
            `You do not have permission to ${operation} this event`,
            403
          );
        }

        // Additional check: only organizers and admins can perform write operations
        if (userRole === 'user') {
          throw new AppError(
            ErrorCode.FORBIDDEN,
            `Your role does not allow you to ${operation} events`,
            403
          );
        }

        console.log(`✅ Owner access granted for ${operation} operation on event ${eventId}`);
        return event;
      }

      // Unknown operation
      throw new AppError(
        ErrorCode.FORBIDDEN,
        `Unknown operation: ${operation}`,
        403
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error verifying event access:', error);
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to verify event access',
        500,
        error
      );
    }
  }

  /**
   * Get events with role-based filtering
   * This method applies authorization rules to filter events based on user role and ownership
   */
  async findManyWithAuthorization(
    params: EventQueryParams,
    userId?: string,
    userRole?: 'user' | 'organizer' | 'admin'
  ): Promise<PaginatedResponse<Event>> {
    try {
      let constrainedParams = { ...params };

      // Apply role-based constraints
      if (!userId || !userRole) {
        // Anonymous users can only see public published events
        constrainedParams = {
          ...constrainedParams,
          status: 'published',
          visibility: 'public',
        };
      } else if (userRole === 'user') {
        // Regular users can only see public published events
        constrainedParams = {
          ...constrainedParams,
          status: 'published',
          visibility: 'public',
        };
      } else if (userRole === 'organizer') {
        // Organizers can see their own events (all statuses)
        // Filter by organizerId to show all their events
        constrainedParams = {
          ...constrainedParams,
          organizerId: userId,
        };
      }
      // Admin users have no constraints - they can see all events

      const result = await this.findMany(constrainedParams);

      return result;
    } catch (error) {
      console.error('Error finding events with authorization:', error);
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to retrieve events',
        500,
        error
      );
    }
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
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

  /**
   * Build optimized filter conditions with proper indexing hints
   */
  private buildFilterConditions(params: EventQueryParams): any[] {
    const conditions = [];
    const {
      status,
      category,
      organizerId,
      fromDate,
      toDate,
      visibility,
      minCapacity,
      maxCapacity,
      priceType,
      minPrice,
      maxPrice,
      hasNFT,
      search
    } = params;

    // Primary filters that use indexes - order matters for query optimization
    
    // 1. Status filter (most selective, uses idx_status_start)
    if (status) {
      conditions.push(eq(events.status, status));
    }
    
    // 2. Organizer filter (uses idx_organizer_created)
    if (organizerId) {
      conditions.push(eq(events.organizerId, organizerId));
    }
    
    // 3. Category filter (uses idx_category_status)
    if (category) {
      conditions.push(eq(events.categoryId, category));
    }
    
    // 4. Visibility filter (uses idx_visibility)
    if (visibility) {
      conditions.push(eq(events.visibility, visibility));
    }
    
    // Date range filters (use idx_start_datetime and idx_end_datetime)
    if (fromDate) {
      const fromDateObj = new Date(fromDate);
      if (!isNaN(fromDateObj.getTime())) {
        conditions.push(gte(events.startDateTime, fromDateObj));
      }
    }
    
    if (toDate) {
      const toDateObj = new Date(toDate);
      if (!isNaN(toDateObj.getTime())) {
        conditions.push(lte(events.endDateTime, toDateObj));
      }
    }
    
    // Secondary filters (may not use indexes)
    
    // Capacity filters
    if (minCapacity !== undefined) {
      conditions.push(gte(events.capacity, minCapacity));
    }
    
    if (maxCapacity !== undefined) {
      conditions.push(lte(events.capacity, maxCapacity));
    }
    
    // Price filters using JSON extraction
    if (priceType !== undefined) {
      if (priceType === 'free') {
        conditions.push(
          or(
            sql`JSON_EXTRACT(${events.price}, '$.type') = 'free'`,
            sql`${events.price} IS NULL`
          )
        );
      } else {
        conditions.push(sql`JSON_EXTRACT(${events.price}, '$.type') = 'paid'`);
      }
    }
    
    if (minPrice !== undefined) {
      conditions.push(sql`JSON_EXTRACT(${events.price}, '$.amount') >= ${minPrice}`);
    }
    
    if (maxPrice !== undefined) {
      conditions.push(sql`JSON_EXTRACT(${events.price}, '$.amount') <= ${maxPrice}`);
    }
    
    // NFT association filter
    if (hasNFT !== undefined) {
      if (hasNFT) {
        conditions.push(sql`${events.metadata} IS NOT NULL AND JSON_LENGTH(${events.metadata}) > 0`);
      } else {
        conditions.push(sql`${events.metadata} IS NULL OR JSON_LENGTH(${events.metadata}) = 0`);
      }
    }
    
    // Full-text search (most expensive, applied last)
    if (search && search.trim()) {
      const sanitizedSearch = search.trim();
      const searchTerms = sanitizedSearch.split(/\s+/).filter(term => term.length > 0);
      
      if (searchTerms.length === 1) {
        const term = searchTerms[0];
        conditions.push(
          or(
            like(events.title, `%${term}%`),
            like(events.description, `%${term}%`),
            like(events.excerpt, `%${term}%`)
          )
        );
      } else {
        // Multi-term search with AND logic - all terms must match
        const termConditions = searchTerms.map(term => 
          or(
            like(events.title, `%${term}%`),
            like(events.description, `%${term}%`),
            like(events.excerpt, `%${term}%`)
          )
        );
        conditions.push(and(...termConditions));
      }
    }

    return conditions;
  }

  /**
   * Get query performance statistics
   */
  async getQueryStats(params: EventQueryParams): Promise<{
    totalEvents: number;
    filteredEvents: number;
    appliedFilters: string[];
    estimatedPerformance: 'fast' | 'medium' | 'slow';
  }> {
    try {
      const conditions = this.buildFilterConditions(params);
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const [totalResult, filteredResult] = await Promise.all([
        db.select({ count: count() }).from(events),
        db.select({ count: count() }).from(events).where(whereClause)
      ]);

      const totalEvents = totalResult[0].count;
      const filteredEvents = filteredResult[0].count;
      
      const appliedFilters = Object.keys(params).filter(key => 
        params[key as keyof EventQueryParams] !== undefined && 
        key !== 'page' && 
        key !== 'limit' &&
        key !== 'sortBy' &&
        key !== 'sortOrder'
      );

      // Estimate performance based on filter selectivity
      let estimatedPerformance: 'fast' | 'medium' | 'slow' = 'fast';
      
      if (appliedFilters.length === 0) {
        estimatedPerformance = 'medium'; // Full table scan
      } else if (appliedFilters.includes('search') && !appliedFilters.includes('status') && !appliedFilters.includes('category')) {
        estimatedPerformance = 'slow'; // Text search without indexed filters
      } else if (filteredEvents > totalEvents * 0.5) {
        estimatedPerformance = 'medium'; // Low selectivity
      }

      return {
        totalEvents,
        filteredEvents,
        appliedFilters,
        estimatedPerformance,
      };
    } catch (error) {
      console.error('Error getting query stats:', error);
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to get query statistics',
        500,
        error
      );
    }
  }
}

// Export singleton instance
export const eventService = new EventService();