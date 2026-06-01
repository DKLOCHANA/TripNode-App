import { useQuery } from '@tanstack/react-query';
import { searchPlaceRating } from '@/data/sources/remote/google/placesPhotoApi';
import { getCachedRating, setCachedRating } from '@/data/repositories/TripRepository';

async function fetchActivityRating(searchQuery: string): Promise<number | null> {
  // Persisted cache first — ratings rarely change and the API call has a cost.
  const cached = await getCachedRating(searchQuery);
  if (cached != null) {
    return cached;
  }

  const rating = await searchPlaceRating(searchQuery);

  if (rating != null) {
    setCachedRating(searchQuery, rating).catch(() => {
      // Silently fail caching.
    });
  }

  return rating;
}

/**
 * Fetches a place's Google rating (0–5) for an activity, mirroring
 * useActivityPhoto: keyed on "name, city", persisted, long-lived.
 */
export function useActivityRating(activityName?: string, city?: string) {
  const searchQuery = activityName && city ? `${activityName}, ${city}` : undefined;

  return useQuery({
    queryKey: searchQuery ? ['activity', 'rating', searchQuery] : ['activity', 'rating', 'unknown'],
    queryFn: () => fetchActivityRating(searchQuery!),
    enabled: Boolean(searchQuery),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
