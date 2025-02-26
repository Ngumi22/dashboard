import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";

const MINUTE = 1000 * 60;

export function useCustomQuery<TData, TError = Error>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime: 10 * MINUTE, // Default stale time
    gcTime: 20 * MINUTE, // Default garbage collection time
    placeholderData: keepPreviousData, // Default placeholder data
    ...options, // Allow overriding defaults
  });
}
