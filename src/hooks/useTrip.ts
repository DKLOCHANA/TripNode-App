import { useQuery } from '@tanstack/react-query';
import type { Itinerary } from '@/domain/entities/Itinerary';
import { queryKeys } from '@/lib/queryKeys';
import { getTripById } from '@/services/tripsStorageService';

export function useTrip(userId?: string, tripId?: string) {
  return useQuery<Itinerary | null>({
    queryKey: tripId ? queryKeys.trips.detail(tripId) : ['trips', 'detail', 'unknown'],
    queryFn: () => getTripById(userId!, tripId!),
    enabled: Boolean(userId && tripId),
    staleTime: 10 * 60 * 1000,
  });
}
