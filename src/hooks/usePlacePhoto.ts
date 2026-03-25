import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getPlacePhotoUri } from '@/data/sources/remote/google/placesPhotoApi';
import { getCachedPhoto, setCachedPhoto } from '@/services/tripsStorageService';

async function fetchPlacePhoto(placeId: string): Promise<string | null> {
  const cacheKey = `place_${placeId}`;

  // Check local cache first
  const cached = await getCachedPhoto(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const photoUri = await getPlacePhotoUri(placeId);

  // Cache the result if found
  if (photoUri) {
    setCachedPhoto(cacheKey, photoUri).catch(() => {
      // Silently fail caching
    });
  }

  return photoUri;
}

export function usePlacePhoto(placeId?: string) {
  return useQuery({
    queryKey: placeId ? queryKeys.places.photo(placeId) : ['places', 'photo', 'unknown'],
    queryFn: () => fetchPlacePhoto(placeId!),
    enabled: Boolean(placeId),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
