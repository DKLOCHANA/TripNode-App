import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { subscriptionRepository } from '@/data/repositories/SubscriptionRepository';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { format, parseISO, differenceInDays } from 'date-fns';

/**
 * Hook to get subscription status for the current user
 */
export function useSubscriptionStatus() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.uid ?? '';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.subscription.status(userId),
    queryFn: () => subscriptionRepository.getSubscriptionStatus(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute - subscription status should be fresh
    gcTime: 5 * 60 * 1000, // 5 minutes cache
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

  // Invalidate and refetch subscription data
  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.subscription.status(userId),
    });
  }, [queryClient, userId]);

  return {
    subscription: query.data,
    isActive: query.data?.isActive ?? false,
    isPro: query.data?.tier === 'pro',
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
  };
}
