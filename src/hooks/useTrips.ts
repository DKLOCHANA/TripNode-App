import { useQuery } from '@tanstack/react-query';
import type { Itinerary } from '@/domain/entities/Itinerary';
import { queryKeys } from '@/lib/queryKeys';
import { getTripsByUser } from '@/services/tripsStorageService';

export function useTrips(userId?: string) {
  return useQuery<Itinerary[]>({
    queryKey: userId ? queryKeys.trips.all(userId) : ['trips', 'anonymous'],
    queryFn: () => getTripsByUser(userId!),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}
