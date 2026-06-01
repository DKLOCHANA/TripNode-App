import { useState, useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { type PurchasesPackage } from 'react-native-purchases';
import { REVENUECAT } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { useHaptic } from '@/hooks/useHaptic';
import { checkNetworkAndAlert } from '@/lib/network';
import { revenueCatService } from '@/services/revenueCatService';
import { queryKeys } from '@/lib/queryKeys';
import { recordFirstPurchase } from '@/data/sources/local/purchaseStorage';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

type PlanType = 'annual' | 'monthly';

interface PackageInfo {
  package: PurchasesPackage;
  price: string;
  pricePerMonth?: string;
}

// Fallbacks match the App Store / RevenueCat configured prices. Used only if
// the offerings fetch fails — RevenueCat is the source of truth at runtime.
const FALLBACK_ANNUAL_PRICE = '$59.99';
const FALLBACK_ANNUAL_PER_MONTH = '$5.00';
const FALLBACK_MONTHLY_PRICE = '$9.99';
const FALLBACK_ANNUAL_NUM = 59.99;
const FALLBACK_MONTHLY_NUM = 9.99;

// The annual plan includes a 3-day free trial (monthly does not).
const FREE_TRIAL_DAYS = 3;

/** Re-format an amount using the currency symbol/position of a sample price
 *  string (e.g. template "$9.99" + 119.88 → "$119.88"). */
function formatLikePrice(template: string, amount: number): string {
  const formatted = amount.toFixed(2);
  const match = template.match(/[\d.,]+/);
  return match ? template.replace(match[0], formatted) : `$${formatted}`;
}

export function usePaywallViewModel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const haptic = useHaptic();

  // When the hard paywall is shown because a previously-purchased subscription
  // lapsed (vs. a brand-new user), surface an "expired" notice so the screen
  // explains why access was removed.
  const subscription = useSubscriptionStatus();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [packages, setPackages] = useState<{
    annual: PackageInfo | null;
    monthly: PackageInfo | null;
  }>({ annual: null, monthly: null });

  // After a successful purchase or restore, the gate hook listening on
  // customerInfo updates will flip to 'pro' and the root router will land us
  // on /(app)/plan automatically — we just need to invalidate the React Query
  // cache so any in-app subscription views are fresh, and persist the local
  // first-purchase timestamp so the renewal-reminder scheduler can pick it up.
  const onProConfirmed = useCallback(async () => {
    await recordFirstPurchase();
    if (user) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.status(user.uid),
      });
    }
    router.replace('/(app)/plan');
  }, [queryClient, router, user]);

  // Fetch offerings on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const available = await revenueCatService.getPackages();
        if (cancelled) return;

        const annualPkg = available.find((p) => p.identifier === REVENUECAT.PACKAGE_ANNUAL);
        const monthlyPkg = available.find((p) => p.identifier === REVENUECAT.PACKAGE_MONTHLY);

        setPackages({
          annual: annualPkg
            ? {
                package: annualPkg,
                price: annualPkg.product.priceString,
                pricePerMonth: annualPkg.product.price
                  ? `$${(annualPkg.product.price / 12).toFixed(2)}`
                  : undefined,
              }
            : null,
          monthly: monthlyPkg
            ? {
                package: monthlyPkg,
                price: monthlyPkg.product.priceString,
              }
            : null,
        });
      } catch (error) {
        console.warn('[Paywall] Failed to fetch packages', error);
      } finally {
        if (!cancelled) setIsLoadingPackages(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectPlan = useCallback(
    (plan: PlanType) => {
      haptic.lightImpact();
      setSelectedPlan(plan);
    },
    [haptic]
  );

  const handlePurchase = useCallback(async () => {
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    const selected = selectedPlan === 'annual' ? packages.annual : packages.monthly;
    if (!selected) {
      Alert.alert('Unavailable', 'This plan is not available right now. Please try again.');
      return;
    }

    setIsPurchasing(true);
    try {
      const customerInfo = await revenueCatService.purchasePackage(selected.package);
      const isPro = customerInfo?.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;

      if (isPro) {
        haptic.success();
        await onProConfirmed();
      }
    } catch (error: any) {
      const isUserCancelled =
        error?.userCancelled === true ||
        error?.code === 'PURCHASE_CANCELLED' ||
        String(error?.code) === '1';

      if (isUserCancelled) return;

      // Test Store simulation in dev — surface it gently so devs aren't confused.
      const isTestStoreError =
        __DEV__ && error?.code === '5' && error?.message?.includes('Test purchase');
      if (isTestStoreError) {
        Alert.alert(
          'Test Store Mode',
          'This is a simulated test purchase. In production, real purchases will work.'
        );
        return;
      }

      haptic.error();
      Alert.alert(
        'Purchase Failed',
        error?.message || 'Something went wrong. Please try again later.'
      );
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedPlan, packages, haptic, onProConfirmed]);

  const handleRestorePurchases = useCallback(async () => {
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    setIsRestoring(true);
    try {
      const customerInfo = await revenueCatService.restorePurchases();
      const isPro = customerInfo?.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;

      if (isPro) {
        haptic.success();
        await onProConfirmed();
      } else {
        Alert.alert(
          'No Purchases Found',
          "We couldn't find an active subscription on this Apple ID."
        );
      }
    } catch (error: any) {
      haptic.error();
      Alert.alert(
        'Restore Failed',
        error?.message || 'Unable to restore purchases. Please try again.'
      );
    } finally {
      setIsRestoring(false);
    }
  }, [haptic, onProConfirmed]);

  const handleTermsOfService = useCallback(() => {
    Linking.openURL('https://dklochana.github.io/TripNode/terms-of-service/').catch(() => {
      Alert.alert('Error', 'Unable to open terms of service');
    });
  }, []);

  const handlePrivacyPolicy = useCallback(() => {
    Linking.openURL('https://dklochana.github.io/TripNode/privacy-policy/').catch(() => {
      Alert.alert('Error', 'Unable to open privacy policy');
    });
  }, []);

  // Savings vs. paying monthly for a year, and the equivalent "would-be" yearly
  // price to strike through. Computed from real package prices when available.
  const annualNum = packages.annual?.package.product.price ?? FALLBACK_ANNUAL_NUM;
  const monthlyNum = packages.monthly?.package.product.price ?? FALLBACK_MONTHLY_NUM;
  const monthlyTemplate = packages.monthly?.price ?? FALLBACK_MONTHLY_PRICE;

  const annualSavingsPercent =
    monthlyNum > 0 ? Math.max(0, Math.round((1 - annualNum / (monthlyNum * 12)) * 100)) : null;
  const annualOriginalPrice = formatLikePrice(monthlyTemplate, monthlyNum * 12);

  return {
    selectedPlan,
    isPurchasing,
    isRestoring,
    isLoadingPackages,
    isExpired: subscription.isExpired,
    packages,
    annualPrice: packages.annual?.price ?? FALLBACK_ANNUAL_PRICE,
    annualPricePerMonth: packages.annual?.pricePerMonth ?? FALLBACK_ANNUAL_PER_MONTH,
    monthlyPrice: packages.monthly?.price ?? FALLBACK_MONTHLY_PRICE,
    annualSavingsPercent,
    annualOriginalPrice,
    freeTrialDays: FREE_TRIAL_DAYS,
    handleSelectPlan,
    handlePurchase,
    handleRestorePurchases,
    handleTermsOfService,
    handlePrivacyPolicy,
  };
}
