import { QueryClient } from '@tanstack/react-query';
import { isDomainError } from '@/errors/DomainError';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Never retry 4xx errors — they won't resolve on retry
        if (isDomainError(error)) {
          if (error.type === 'AuthError') return false;
          if (error.type === 'NotFoundError') return false;
          if (error.type === 'ValidationError') return false;
        }
        return failureCount < 3; // Retry up to 3x for 5xx / network errors
      },
      staleTime: 5 * 60 * 1000, // 5 min default
      gcTime: 10 * 60 * 1000, // Keep unused cache for 10 min
    },
    mutations: {
      retry: false, // Never auto-retry mutations
    },
  },
});
