import { useMutation } from '@tanstack/react-query';
import type { Itinerary } from '@/domain/entities/Itinerary';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { saveTrip } from '@/services/tripsStorageService';
import { userRepository } from '@/data/repositories/UserRepository';

export function useSaveTrip(userId?: string) {
  return useMutation({
    mutationFn: (itinerary: Itinerary) => saveTrip(itinerary),
    onSuccess: (savedTrip) => {
      if (!userId) return;

      queryClient.setQueryData<Itinerary[]>(queryKeys.trips.all(userId), (oldTrips) => {
        const currentTrips = oldTrips ?? [];
        return [savedTrip, ...currentTrips.filter((trip) => trip.id !== savedTrip.id)];
      });

      queryClient.setQueryData(queryKeys.trips.detail(savedTrip.id), savedTrip);

      userRepository.incrementTripCount(userId)
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.user.tripCount(userId),
          });
        })
        .catch((err) => console.warn('Failed to increment trip count:', err));
    },
  });
}
