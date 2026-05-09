import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { subscriptionRepository } from '@/data/repositories/SubscriptionRepository';
import { userRepository } from '@/data/repositories/UserRepository';
import { queryKeys } from '@/lib/queryKeys';
import { FREE_TRIP_LIMIT } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { format, parseISO, differenceInDays } from 'date-fns';

/**
 * Hook to get subscription status for the current user
 */
export function useSubscriptionStatus() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.uid ?? '';
  const queryClient = useQueryClient();
  const router = useRouter();

  const query = useQuery({
    queryKey: queryKeys.subscription.status(userId),
    queryFn: () => subscriptionRepository.getSubscriptionStatus(userId),
    enabled: !!userId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const tripCountQuery = useQuery({
    queryKey: queryKeys.user.tripCount(userId),
    queryFn: () => userRepository.getLifetimeTripCount(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Format expiry date for display
  const formattedExpiryDate = useMemo(() => {
    if (!query.data?.expiresAt) return null;
    try {
      return format(parseISO(query.data.expiresAt), 'MMM d, yyyy');
    } catch {
      return null;
    }
  }, [query.data?.expiresAt]);

  // Check if subscription is expiring soon (within 7 days)
  const isExpiringSoon = useMemo(() => {
    if (!query.data?.expiresAt || !query.data.isActive || query.data.renewsAutomatically) {
      return false;
    }
    try {
      const expiryDate = parseISO(query.data.expiresAt);
      const daysUntilExpiry = differenceInDays(expiryDate, new Date());
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    } catch {
      return false;
    }
  }, [query.data?.expiresAt, query.data?.isActive, query.data?.renewsAutomatically]);

  // Calculate days until expiry
  const daysUntilExpiry = useMemo(() => {
    if (!query.data?.expiresAt) return null;
    try {
      const expiryDate = parseISO(query.data.expiresAt);
      return differenceInDays(expiryDate, new Date());
    } catch {
      return null;
    }
  }, [query.data?.expiresAt]);

  const lifetimeTripCount = tripCountQuery.data ?? 0;
  const isPro = query.data?.tier === 'pro';

  const canCreateTrip = useMemo(
    () => isPro || lifetimeTripCount < FREE_TRIP_LIMIT,
    [isPro, lifetimeTripCount]
  );

  const checkAndGate = useCallback((): boolean => {
    if (canCreateTrip) return true;
    router.push('/paywall');
    return false;
  }, [canCreateTrip, router]);

  // Invalidate and refetch subscription data
  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.subscription.status(userId),
    });
  }, [queryClient, userId]);

  return {
    subscription: query.data,
    isActive: query.data?.isActive ?? false,
    isPro,
    tier: query.data?.tier ?? 'free',
    expiresAt: query.data?.expiresAt ?? null,
    formattedExpiryDate,
    renewsAutomatically: query.data?.renewsAutomatically ?? false,
    isExpired: query.data?.isExpired ?? false,
    isExpiringSoon,
    daysUntilExpiry,
    productIdentifier: query.data?.productIdentifier ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    invalidate,
    lifetimeTripCount,
    canCreateTrip,
    checkAndGate,
  };
}
