import { useMutation } from '@tanstack/react-query';
import type { Itinerary } from '@/domain/entities/Itinerary';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { deleteTripById } from '@/services/tripsStorageService';

export function useDeleteTrip(userId?: string) {
  return useMutation({
    mutationFn: (tripId: string) => {
      if (!userId) throw new Error('User id is required to delete trip');
      return deleteTripById(userId, tripId);
    },

    onMutate: async (tripId) => {
      if (!userId) return { previousTrips: [] as Itinerary[] };

      const key = queryKeys.trips.all(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previousTrips = queryClient.getQueryData<Itinerary[]>(key) ?? [];

      queryClient.setQueryData<Itinerary[]>(
        key,
        previousTrips.filter((trip) => trip.id !== tripId)
      );

      return { previousTrips };
    },

    onError: (_error, _tripId, context) => {
      if (!userId) return;
      queryClient.setQueryData(queryKeys.trips.all(userId), context?.previousTrips ?? []);
    },

    onSuccess: (_data, tripId) => {
      queryClient.removeQueries({ queryKey: queryKeys.trips.detail(tripId) });
    },
  });
}
