// Re-export everything from the query module
export { queryClient, queryKeys, invalidateQueries } from './client';
export { QueryProvider } from './provider';

// Re-export commonly used TanStack Query hooks and utilities
export {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  useSuspenseQuery,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';