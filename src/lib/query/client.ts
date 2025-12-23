import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized defaults for the events system
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 1000 * 60 * 5,
      // Keep data in cache for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests up to 3 times
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect to avoid excessive requests
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Global error handling for mutations
      onError: (error) => {
        console.error('Mutation error:', error);
        // TODO: Add toast notification here
      },
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Events queries
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (params: Record<string, any>) => [...queryKeys.events.lists(), params] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
  },
  // Categories queries
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (params: Record<string, any>) => [...queryKeys.categories.lists(), params] as const,
  },
  // User queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    events: (userId: string) => [...queryKeys.user.all, 'events', userId] as const,
  },
} as const;

// Helper function to invalidate related queries
export const invalidateQueries = {
  events: {
    all: () => queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
    lists: () => queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(id) }),
  },
  categories: {
    all: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  },
  user: {
    events: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.user.events(userId) }),
  },
};