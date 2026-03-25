import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Itinerary } from '@/domain/entities/Itinerary';
import { useTripGenerationStore } from '@/store/tripGenerationStore';
import { useSaveTrip } from './useSaveTrip';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook for trip generation mutation
 * Wraps the trip generation flow with proper cache invalidation
 */
export function useGenerateTrip(userId: string | undefined) {
  const queryClient = useQueryClient();
  const generationStore = useTripGenerationStore();
  const saveTripMutation = useSaveTrip(userId);

  const mutation = useMutation({
    mutationFn: async (itinerary: Itinerary) => {
      // Save the generated trip
      await saveTripMutation.mutateAsync(itinerary);
      return itinerary;
    },
    onSuccess: (itinerary) => {
      // Store the generated itinerary
      generationStore.setGeneratedItinerary(itinerary);
      
      // Invalidate trips cache to refresh the list
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.all(userId) });
      }
    },
    onError: (error) => {
      generationStore.setError(
        error instanceof Error ? error.message : 'Failed to save trip'
      );
    },
  });

  return {
    generateTrip: mutation.mutate,
    generateTripAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error,
  };
}
