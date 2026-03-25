import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import type { Itinerary } from '@/domain/entities/Itinerary';
import { useAuthStore } from '@/store/authStore';
import { useDeleteTrip, useTrips, useHaptic } from '@/hooks';
import { checkNetworkAndAlert } from '@/lib/network';

export function useMyTripsViewModel() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.uid);
  const { data, isLoading, isFetching } = useTrips(userId);
  const deleteTripMutation = useDeleteTrip(userId);
  const haptic = useHaptic();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const trips = data ?? [];

  const pendingDeleteTrip = useMemo(
    () => trips.find((trip) => trip.id === pendingDeleteId) ?? null,
    [trips, pendingDeleteId]
  );

  const handlePlanTrip = useCallback(() => {
    router.push('/(app)/plan');
  }, [router]);

  const handleOpenTrip = useCallback(
    (tripId: string) => {
      router.push(`/(app)/trips/${tripId}`);
    },
    [router]
  );

  const requestDeleteTrip = useCallback((tripId: string) => {
    setPendingDeleteId(tripId);
  }, []);

  const cancelDeleteTrip = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

  const confirmDeleteTrip = useCallback(async () => {
    if (!pendingDeleteId) return;

    // Check network connectivity first
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    await deleteTripMutation.mutateAsync(pendingDeleteId);
    setPendingDeleteId(null);
  }, [deleteTripMutation, pendingDeleteId, haptic]);

  return {
    trips,
    isLoadingTrips: isLoading || (isFetching && !data),
    isDeletingTrip: deleteTripMutation.isPending,
    pendingDeleteTrip,

    handlePlanTrip,
    handleOpenTrip,
    requestDeleteTrip,
    cancelDeleteTrip,
    confirmDeleteTrip,
  };
}
