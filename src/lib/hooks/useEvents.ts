import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateQueries } from '@/lib/query';
import type { 
  Event, 
  CreateEventRequest, 
  UpdateEventRequest, 
  PaginatedResponse 
} from '@/types/api.types';
import type { EventQueryParams } from '@/types/event.types';

// API functions
const eventsApi = {
  // Fetch paginated events list
  getEvents: async (params: EventQueryParams = {}): Promise<PaginatedResponse<Event>> => {
    const searchParams = new URLSearchParams();
    
    // Add all defined parameters to the query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response = await fetch(`/api/events?${searchParams.toString()}`, {
      headers: {
        // Temporary development auth - replace with proper JWT token in production
        'x-organizer-id': 'dev-user-123',
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch events' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || result; // Handle both wrapped and direct responses
  },

  // Fetch single event by ID
  getEvent: async (id: string): Promise<Event> => {
    const response = await fetch(`/api/events/${id}`, {
      headers: {
        // Temporary development auth - replace with proper JWT token in production
        'x-organizer-id': 'dev-user-123',
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch event' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Create new event
  createEvent: async (data: CreateEventRequest): Promise<Event> => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Temporary development auth - replace with proper JWT token in production
        'x-organizer-id': 'dev-user-123',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create event' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Update existing event
  updateEvent: async ({ id, data }: { id: string; data: UpdateEventRequest }): Promise<Event> => {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Temporary development auth - replace with proper JWT token in production
        'x-organizer-id': 'dev-user-123',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update event' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Delete event (soft delete/archive)
  deleteEvent: async (id: string): Promise<void> => {
    const response = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
      headers: {
        // Temporary development auth - replace with proper JWT token in production
        'x-organizer-id': 'dev-user-123',
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete event' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
  },
};

// Custom hooks

/**
 * Hook to fetch paginated events with filtering and search
 */
export function useEvents(params: EventQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => eventsApi.getEvents(params),
    // Enable background refetching for fresh data
    staleTime: 1000 * 60 * 2, // 2 minutes
    // Keep data fresh when params change
    refetchOnMount: true,
  });
}

/**
 * Hook to fetch a single event by ID
 */
export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => eventsApi.getEvent(id),
    enabled: !!id, // Only run query if ID is provided
    staleTime: 1000 * 60 * 5, // 5 minutes - individual events change less frequently
  });
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.createEvent,
    onSuccess: (newEvent) => {
      // Invalidate events lists to show the new event
      invalidateQueries.events.lists();
      
      // Optionally add the new event to the cache
      queryClient.setQueryData(
        queryKeys.events.detail(newEvent.id),
        newEvent
      );
      
      console.log('✅ Event created successfully:', newEvent.title);
    },
    onError: (error) => {
      console.error('❌ Failed to create event:', error.message);
    },
  });
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.updateEvent,
    onSuccess: (updatedEvent, variables) => {
      // Update the specific event in cache
      queryClient.setQueryData(
        queryKeys.events.detail(variables.id),
        updatedEvent
      );
      
      // Invalidate events lists to reflect changes
      invalidateQueries.events.lists();
      
      console.log('✅ Event updated successfully:', updatedEvent.title);
    },
    onError: (error) => {
      console.error('❌ Failed to update event:', error.message);
    },
  });
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.deleteEvent,
    onSuccess: (_, eventId) => {
      // Remove the event from cache
      queryClient.removeQueries({
        queryKey: queryKeys.events.detail(eventId)
      });
      
      // Invalidate events lists to remove the deleted event
      invalidateQueries.events.lists();
      
      console.log('✅ Event deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to delete event:', error.message);
    },
  });
}

/**
 * Hook for optimistic updates when creating events
 * Useful for immediate UI feedback
 */
export function useOptimisticCreateEvent() {
  const queryClient = useQueryClient();
  const createMutation = useCreateEvent();

  return {
    ...createMutation,
    mutateAsync: async (data: CreateEventRequest) => {
      // Create optimistic event for immediate UI feedback
      const optimisticEvent: Partial<Event> = {
        id: `temp-${Date.now()}`,
        title: data.title,
        description: data.description,
        status: 'draft',
        visibility: data.visibility || 'public',
        // Add other fields as needed
      };

      // Optimistically update the cache
      const previousEvents = queryClient.getQueryData(queryKeys.events.lists());
      
      // Add optimistic event to the beginning of the list
      if (previousEvents) {
        queryClient.setQueryData(queryKeys.events.lists(), (old: any) => ({
          ...old,
          data: [optimisticEvent, ...old.data],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        }));
      }

      try {
        // Perform the actual mutation
        const result = await createMutation.mutateAsync(data);
        return result;
      } catch (error) {
        // Revert optimistic update on error
        if (previousEvents) {
          queryClient.setQueryData(queryKeys.events.lists(), previousEvents);
        }
        throw error;
      }
    },
  };
}