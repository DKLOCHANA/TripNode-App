import { useQuery } from '@tanstack/react-query';
import type { Itinerary } from '@/domain/entities/Itinerary';
import { queryKeys } from '@/lib/queryKeys';
import { getPlacePhotoUri, searchPlaceAndGetPhoto } from '@/data/sources/remote/google/placesPhotoApi';
import { getCachedPhoto, setCachedPhoto } from '@/services/tripsStorageService';

/**
 * Extracts all activity names from an itinerary for fallback photo search
 */
function getActivityNames(itinerary: Itinerary): string[] {
  const names: string[] = [];
  for (const day of itinerary.days) {
    for (const activity of day.activities) {
      if (activity.name) {
        names.push(activity.name);
      }
    }
  }
  return names;
}

/**
 * Fetches a photo for the trip card with fallback logic:
 * 1. Try destination placeId
 * 2. If unavailable, try activities from the itinerary
 */
async function fetchTripCardPhoto(itinerary: Itinerary): Promise<string | null> {
  const destinationPlaceId = itinerary.destination.placeId;
  const destinationName = itinerary.destination.name;
  const cacheKey = `tripcard_${itinerary.id}`;

  // Check local cache first
  const cached = await getCachedPhoto(cacheKey);
  if (cached) {
    return cached;
  }

  // 1. Try destination placeId first
  if (destinationPlaceId) {
    try {
      const destinationPhoto = await getPlacePhotoUri(destinationPlaceId);
      if (destinationPhoto) {
        setCachedPhoto(cacheKey, destinationPhoto).catch(() => {});
        return destinationPhoto;
      }
    } catch {
      // Continue to fallback
    }
  }

  // 2. Fallback: Try activities from the itinerary
  const activityNames = getActivityNames(itinerary);
  
  for (const activityName of activityNames) {
    try {
      const searchQuery = `${activityName}, ${destinationName}`;
      const activityPhoto = await searchPlaceAndGetPhoto(searchQuery);
      if (activityPhoto) {
        setCachedPhoto(cacheKey, activityPhoto).catch(() => {});
        return activityPhoto;
      }
    } catch {
      // Try next activity
      continue;
    }
  }

  return null;
}

/**
 * Hook to get a photo for trip card with fallback to activity photos
 * 
 * Follows the pattern from usePlacePhoto but adds fallback logic:
 * - First tries the main destination photo (via placeId)
 * - If unavailable, iterates through itinerary activities to find any available photo
 */
export function useTripCardPhoto(itinerary?: Itinerary) {
  return useQuery({
    queryKey: itinerary 
      ? queryKeys.trips.cardPhoto(itinerary.id) 
      : ['trips', 'cardPhoto', 'unknown'],
    queryFn: () => fetchTripCardPhoto(itinerary!),
    enabled: Boolean(itinerary),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000,
  });
}
