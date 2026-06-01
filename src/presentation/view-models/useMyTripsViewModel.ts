import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import type { Itinerary } from '@/domain/entities/Itinerary';
import { useAuthStore } from '@/store/authStore';
import { useDeleteTrip, useTrips, useHaptic } from '@/hooks';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { checkNetworkAndAlert } from '@/lib/network';

export function useMyTripsViewModel() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.uid);
  const { data, isLoading, isFetching } = useTrips(userId);
  const deleteTripMutation = useDeleteTrip(userId);
  const haptic = useHaptic();
  const subscription = useSubscriptionStatus();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const trips = data ?? [];

  const pendingDeleteTrip = useMemo(
    () => trips.find((trip) => trip.id === pendingDeleteId) ?? null,
    [trips, pendingDeleteId]
  );

  // Read-only split into upcoming (ongoing or future) and past, used to render
  // the two sections. Upcoming is sorted nearest-first; past most-recent-first.
  const { upcomingTrips, pastTrips } = useMemo(() => {
    const now = Date.now();
    const upcoming: Itinerary[] = [];
    const past: Itinerary[] = [];

    for (const trip of trips) {
      const end = new Date(trip.endDateUtc).getTime();
      (Number.isFinite(end) && end < now ? past : upcoming).push(trip);
    }

    upcoming.sort(
      (a, b) => new Date(a.startDateUtc).getTime() - new Date(b.startDateUtc).getTime()
    );
    past.sort(
      (a, b) => new Date(b.startDateUtc).getTime() - new Date(a.startDateUtc).getTime()
    );

    return { upcomingTrips: upcoming, pastTrips: past };
  }, [trips]);

  const handlePlanTrip = useCallback(() => {
    if (!subscription.checkAndGate()) return;
    router.push('/(app)/plan');
  }, [router, subscription]);

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
    upcomingTrips,
    pastTrips,
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
