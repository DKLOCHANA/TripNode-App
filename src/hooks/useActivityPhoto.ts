import { useQuery } from '@tanstack/react-query';
import { searchPlaceAndGetPhoto } from '@/data/sources/remote/google/placesPhotoApi';
import { getCachedPhoto, setCachedPhoto } from '@/services/tripsStorageService';

async function fetchActivityPhoto(searchQuery: string): Promise<string | null> {
  // Check local cache first
  const cached = await getCachedPhoto(searchQuery);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const photoUri = await searchPlaceAndGetPhoto(searchQuery);

  // Cache the result if found
  if (photoUri) {
    setCachedPhoto(searchQuery, photoUri).catch(() => {
      // Silently fail caching
    });
  }

  return photoUri;
}

export function useActivityPhoto(activityName?: string, city?: string) {
  const searchQuery = activityName && city ? `${activityName}, ${city}` : undefined;

  return useQuery({
    queryKey: searchQuery ? ['activity', 'photo', searchQuery] : ['activity', 'photo', 'unknown'],
    queryFn: () => fetchActivityPhoto(searchQuery!),
    enabled: Boolean(searchQuery),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
