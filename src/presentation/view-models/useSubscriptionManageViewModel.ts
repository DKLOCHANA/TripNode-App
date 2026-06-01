import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useHaptic } from '@/hooks/useHaptic';
import { PACKAGE_TYPE } from 'react-native-purchases';
import { revenueCatService } from '@/services/revenueCatService';
import { REVENUECAT } from '@/lib/constants';
import {
  shouldUsePreviewSubscription,
  PREVIEW_PRICE_LABEL,
  PREVIEW_PLAN_PERIOD,
} from '@/data/preview/subscriptionPreview';
import { queryKeys } from '@/lib/queryKeys';
import { checkNetworkAndAlert } from '@/lib/network';

export function useSubscriptionManageViewModel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const haptic = useHaptic();
  const subscription = useSubscriptionStatus();

  const [isLoading, setIsLoading] = useState(false);
  const [managementURL, setManagementURL] = useState<string | null>(null);
  const [priceLabel, setPriceLabel] = useState<string | null>(null);
  // Billing period resolved from the matched package's `packageType` — the
  // authoritative source (the product-id heuristic below is only a fallback).
  const [resolvedPeriod, setResolvedPeriod] = useState<'annual' | 'monthly' | null>(null);

  // Fetch management URL on mount
  useEffect(() => {
    const fetchManagementURL = async () => {
      try {
        const url = await revenueCatService.getManagementURL();
        setManagementURL(url);
      } catch {
        // Silent fail
      }
    };

    if (subscription.isPro) {
      fetchManagementURL();
    }
  }, [subscription.isPro]);

  // Plan type derived from the active product identifier — drives both the
  // short plan label and the price-period suffix.
  const planType = useMemo<'annual' | 'monthly' | 'other'>(() => {
    const id = subscription.productIdentifier?.toLowerCase() ?? '';
    if (id.includes('annual') || id.includes('year')) return 'annual';
    if (id.includes('month')) return 'monthly';
    return 'other';
  }, [subscription.productIdentifier]);

  // Fetch the store price + billing period for the user's active product from
  // RevenueCat's offerings (the active-subscription info carries neither).
  // Read-only.
  useEffect(() => {
    if (!subscription.isPro || !subscription.productIdentifier) {
      setPriceLabel(null);
      setResolvedPeriod(null);
      return;
    }

    // Dev-only: Expo Go has no offerings, so use sample price/period.
    if (shouldUsePreviewSubscription()) {
      setResolvedPeriod(PREVIEW_PLAN_PERIOD);
      setPriceLabel(PREVIEW_PRICE_LABEL);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const packages = await revenueCatService.getPackages();
        const match = packages.find(
          (p) => p.product.identifier === subscription.productIdentifier
        );
        if (cancelled || !match) return;

        const period: 'annual' | 'monthly' | null =
          match.packageType === PACKAGE_TYPE.ANNUAL
            ? 'annual'
            : match.packageType === PACKAGE_TYPE.MONTHLY
            ? 'monthly'
            : planType === 'other'
            ? null
            : planType;
        setResolvedPeriod(period);

        const suffix = period === 'annual' ? '/yr' : period === 'monthly' ? '/mo' : '';
        setPriceLabel(`${match.product.priceString}${suffix}`);
      } catch {
        // Silent — the price pill simply won't render.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [subscription.isPro, subscription.productIdentifier, planType]);

  // Short labels for the premium card. Prefer the authoritative period from the
  // matched package, falling back to the product-id heuristic.
  const effectivePeriod = resolvedPeriod ?? (planType === 'other' ? null : planType);
  const planLabel = effectivePeriod === 'annual' ? 'Annual' : effectivePeriod === 'monthly' ? 'Monthly' : 'Premium';
  const expiryDateShort = subscription.formattedExpiryDate?.split(',')[0] ?? null;

  // Full plan name (kept for any caller that wants the long form).
  const getPlanName = useCallback(() => {
    if (planType === 'annual') return 'Annual Plan';
    if (planType === 'monthly') return 'Monthly Plan';
    return 'Premium Plan';
  }, [planType]);

  // Handle opening subscription management in App Store
  const handleManageSubscription = useCallback(async () => {
    haptic.lightImpact();

    if (managementURL) {
      try {
        await Linking.openURL(managementURL);
      } catch {
        Alert.alert('Error', 'Unable to open subscription management.');
      }
    } else {
      // Fallback to iOS subscription settings
      try {
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
      } catch {
        Alert.alert('Error', 'Unable to open subscription settings.');
      }
    }
  }, [managementURL, haptic]);

  // Handle opening Customer Center
  const handleOpenCustomerCenter = useCallback(async () => {
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    haptic.lightImpact();
    setIsLoading(true);

    try {
      await revenueCatService.presentCustomerCenter();
      
      // Refresh subscription status after customer center closes
      if (user) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.subscription.status(user.uid),
        });
      }
    } catch (error: any) {
      // Customer center might not be available in sandbox
      console.warn('Customer Center error:', error);
      // Fallback to management URL
      handleManageSubscription();
    } finally {
      setIsLoading(false);
    }
  }, [user, queryClient, haptic, handleManageSubscription]);

  // Handle cancellation - redirects to App Store subscription management.
  // Apple requires that paying users can reach the cancel path from the app.
  const handleCancelSubscription = useCallback(async () => {
    haptic.lightImpact();

    Alert.alert(
      'Cancel Subscription',
      "To cancel your subscription, you'll be redirected to your App Store subscription settings.",
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Continue',
          onPress: handleManageSubscription,
        },
      ]
    );
  }, [haptic, handleManageSubscription]);

  // Handle going back
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // Handle restore purchases
  const handleRestorePurchases = useCallback(async () => {
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    setIsLoading(true);
    try {
      const customerInfo = await revenueCatService.restorePurchases();
      
      if (user) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.subscription.status(user.uid),
        });
      }

      // Check if customer info exists and has the entitlement
      const isProNow = customerInfo?.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;
      
      if (isProNow) {
        haptic.success();
        Alert.alert('Success', 'Your subscription has been restored!');
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
      }
    } catch (error: any) {
      haptic.error();
      Alert.alert('Restore Failed', error?.message || 'Unable to restore purchases.');
    } finally {
      setIsLoading(false);
    }
  }, [user, queryClient, haptic]);

  return {
    // Subscription data
    isPro: subscription.isPro,
    isExpired: subscription.isExpired,
    isExpiringSoon: subscription.isExpiringSoon,
    planName: getPlanName(),
    planLabel,
    priceLabel,
    expiryDate: subscription.formattedExpiryDate,
    expiryDateShort,
    renewsAutomatically: subscription.renewsAutomatically,
    daysUntilExpiry: subscription.daysUntilExpiry,
    isSubscriptionLoading: subscription.isLoading,

    // Loading states
    isLoading,

    // Actions
    handleManageSubscription,
    handleOpenCustomerCenter,
    handleCancelSubscription,
    handleRestorePurchases,
    handleGoBack,
  };
}
