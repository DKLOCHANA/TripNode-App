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

type PlanType = 'annual' | 'monthly';

interface PackageInfo {
  package: PurchasesPackage;
  price: string;
  pricePerMonth?: string;
}

export function usePaywallViewModel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const haptic = useHaptic();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [packages, setPackages] = useState<{
    annual: PackageInfo | null;
    monthly: PackageInfo | null;
  }>({
    annual: null,
    monthly: null,
  });

  // Fetch packages on mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const availablePackages = await revenueCatService.getPackages();
        
        const annualPkg = availablePackages.find(
          (p) => p.identifier === REVENUECAT.PACKAGE_ANNUAL
        );
        const monthlyPkg = availablePackages.find(
          (p) => p.identifier === REVENUECAT.PACKAGE_MONTHLY
        );

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
        console.warn('Failed to fetch packages:', error);
      } finally {
        setIsLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  const handleSelectPlan = useCallback((plan: PlanType) => {
    haptic.lightImpact();
    setSelectedPlan(plan);
  }, [haptic]);

  const handlePurchase = useCallback(async () => {
    // Check network connectivity first
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    const selectedPackageInfo = selectedPlan === 'annual' ? packages.annual : packages.monthly;
    
    if (!selectedPackageInfo) {
      Alert.alert('Error', 'Package not available. Please try again.');
      return;
    }

    setIsPurchasing(true);
    try {
      const customerInfo = await revenueCatService.purchasePackage(selectedPackageInfo.package);
      
      // Check if purchase was successful
      const isProNow = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;

      // Invalidate subscription cache
      if (user) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.subscription.status(user.uid),
        });
      }

      if (isProNow) {
        haptic.success();
        Alert.alert('Success', 'Welcome to TripNode Premium!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      // Check if user cancelled
      if (error?.userCancelled || error?.code === 'PURCHASE_CANCELLED') {
        // User cancelled, do nothing
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
  }, [selectedPlan, packages, user, queryClient, router, haptic]);

  const handleRestorePurchases = useCallback(async () => {
    // Check network connectivity first
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    setIsRestoring(true);
    try {
      const customerInfo = await revenueCatService.restorePurchases();
      
      // Check if restore found active subscription
      const isProNow = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;

      if (user) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.subscription.status(user.uid),
        });
      }

      if (isProNow) {
        haptic.success();
        Alert.alert('Restore Complete', 'Your TripNode Premium subscription has been restored!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
      }
    } catch (error: any) {
      haptic.error();
      Alert.alert('Restore Failed', error?.message || 'Unable to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  }, [user, queryClient, haptic, router]);

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

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return {
    selectedPlan,
    isPurchasing,
    isRestoring,
    isLoadingPackages,
    packages,
    // Pricing info for display
    annualPrice: packages.annual?.price ?? '$49.99',
    annualPricePerMonth: packages.annual?.pricePerMonth ?? '$4.17',
    monthlyPrice: packages.monthly?.price ?? '$5.99',
    handleSelectPlan,
    handlePurchase,
    handleRestorePurchases,
    handleTermsOfService,
    handlePrivacyPolicy,
    handleClose,
  };
}
