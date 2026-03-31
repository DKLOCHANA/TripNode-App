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
      console.log('[PaywallVM] 🚀 Starting package fetch...');
      console.log('[PaywallVM] 🔑 Looking for packages:', {
        annual: REVENUECAT.PACKAGE_ANNUAL,
        monthly: REVENUECAT.PACKAGE_MONTHLY,
      });
      
      try {
        console.log('[PaywallVM] 📞 Calling revenueCatService.getPackages()...');
        const availablePackages = await revenueCatService.getPackages();
        
        console.log('[PaywallVM] 📦 Received packages:', availablePackages.length);
        console.log('[PaywallVM] 📦 Package identifiers:', availablePackages.map(p => p.identifier));
        
        const annualPkg = availablePackages.find(
          (p) => p.identifier === REVENUECAT.PACKAGE_ANNUAL
        );
        const monthlyPkg = availablePackages.find(
          (p) => p.identifier === REVENUECAT.PACKAGE_MONTHLY
        );

        console.log('[PaywallVM] 📦 Annual package found:', !!annualPkg, annualPkg?.identifier);
        console.log('[PaywallVM] 📦 Monthly package found:', !!monthlyPkg, monthlyPkg?.identifier);

        if (!annualPkg && !monthlyPkg) {
          console.error('[PaywallVM] ❌ No matching packages found!');
          console.log('[PaywallVM] 📦 Available packages:', availablePackages.map(p => ({
            identifier: p.identifier,
            packageType: p.packageType,
            productId: p.product.identifier,
          })));
        }

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
        
        console.log('[PaywallVM] ✅ Packages set successfully');
      } catch (error) {
        console.error('[PaywallVM] ❌ Failed to fetch packages:', error);
        console.error('[PaywallVM] ❌ Error stack:', error instanceof Error ? error.stack : 'N/A');
      } finally {
        setIsLoadingPackages(false);
        console.log('[PaywallVM] 🏁 Package fetch complete');
      }
    };

    fetchPackages();
  }, []);

  const handleSelectPlan = useCallback((plan: PlanType) => {
    haptic.lightImpact();
    setSelectedPlan(plan);
  }, [haptic]);

  const handlePurchase = useCallback(async () => {
    console.log('[PaywallVM] 💳 handlePurchase() called');
    console.log('[PaywallVM] 💳 Selected plan:', selectedPlan);
    
    // Check network connectivity first
    console.log('[PaywallVM] 🌐 Checking network connectivity...');
    if (!(await checkNetworkAndAlert())) {
      console.error('[PaywallVM] ❌ No network connectivity');
      haptic.error();
      return;
    }
    console.log('[PaywallVM] ✅ Network connectivity OK');

    const selectedPackageInfo = selectedPlan === 'annual' ? packages.annual : packages.monthly;
    
    console.log('[PaywallVM] 💳 Selected package info:', {
      plan: selectedPlan,
      hasPackage: !!selectedPackageInfo,
      packageId: selectedPackageInfo?.package?.identifier,
      price: selectedPackageInfo?.price,
    });
    
    if (!selectedPackageInfo) {
      console.error('[PaywallVM] ❌ Package not available!');
      console.log('[PaywallVM] 📦 Current packages state:', {
        annual: !!packages.annual,
        monthly: !!packages.monthly,
      });
      Alert.alert('Error', 'Package not available. Please try again.');
      return;
    }

    setIsPurchasing(true);
    console.log('[PaywallVM] 💳 Starting purchase flow...');
    
    try {
      console.log('[PaywallVM] 📞 Calling revenueCatService.purchasePackage()...');
      const customerInfo = await revenueCatService.purchasePackage(selectedPackageInfo.package);
      
      console.log('[PaywallVM] 💳 Purchase response received');
      console.log('[PaywallVM] 💳 CustomerInfo:', {
        hasCustomerInfo: !!customerInfo,
        activeEntitlements: customerInfo ? Object.keys(customerInfo.entitlements.active) : [],
      });
      
      // Check if purchase was successful
      const isProNow = customerInfo?.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;
      console.log('[PaywallVM] 💳 Is Pro now:', isProNow);

      // Invalidate subscription cache
      if (user) {
        console.log('[PaywallVM] 🔄 Invalidating subscription cache for user:', user.uid);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.subscription.status(user.uid),
        });
      }

      if (isProNow) {
        console.log('[PaywallVM] ✅ Purchase successful!');
        haptic.success();
        Alert.alert('Success', 'Welcome to TripNode Premium!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        console.warn('[PaywallVM] ⚠️ Purchase completed but Pro entitlement not found');
      }
    } catch (error: any) {
      const isUserCancelled =
        error?.userCancelled === true ||
        error?.code === 'PURCHASE_CANCELLED' ||
        String(error?.code) === '1';

      if (isUserCancelled) {
        console.log('[PaywallVM] ℹ️ User cancelled purchase');
        return;
      }

      const isTestStoreError = __DEV__ && error?.code === '5' && error?.message?.includes('Test purchase');
      
      if (isTestStoreError) {
        // In development with test store, this is expected - just log as warning
        console.warn('[PaywallVM] ⚠️ Test Store purchase simulation:', error?.message);
        Alert.alert(
          'Test Store Mode',
          'This is a simulated test purchase. In production, real purchases will work.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.error('[PaywallVM] ❌ Purchase error:', error);
      console.error('[PaywallVM] ❌ Error code:', error?.code);
      console.error('[PaywallVM] ❌ Error message:', error?.message);
      console.error('[PaywallVM] ❌ User cancelled:', error?.userCancelled);
      
      haptic.error();
      Alert.alert(
        'Purchase Failed',
        error?.message || 'Something went wrong. Please try again later.'
      );
    } finally {
      setIsPurchasing(false);
      console.log('[PaywallVM] 🏁 Purchase flow complete');
    }
  }, [selectedPlan, packages, user, queryClient, router, haptic]);

  const handleRestorePurchases = useCallback(async () => {
    console.log('[PaywallVM] 🔄 handleRestorePurchases() called');
    
    // Check network connectivity first
    console.log('[PaywallVM] 🌐 Checking network connectivity...');
    if (!(await checkNetworkAndAlert())) {
      console.error('[PaywallVM] ❌ No network connectivity');
      haptic.error();
      return;
    }

    setIsRestoring(true);
    console.log('[PaywallVM] 🔄 Starting restore flow...');
    
    try {
      console.log('[PaywallVM] 📞 Calling revenueCatService.restorePurchases()...');
      const customerInfo = await revenueCatService.restorePurchases();
      
      console.log('[PaywallVM] 🔄 Restore response:', {
        hasCustomerInfo: !!customerInfo,
        activeEntitlements: customerInfo ? Object.keys(customerInfo.entitlements.active) : [],
      });
      
      // Check if restore found active subscription
      const isProNow = customerInfo?.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;
      console.log('[PaywallVM] 🔄 Is Pro after restore:', isProNow);

      if (user) {
        console.log('[PaywallVM] 🔄 Invalidating subscription cache...');
        await queryClient.invalidateQueries({
          queryKey: queryKeys.subscription.status(user.uid),
        });
      }

      if (isProNow) {
        console.log('[PaywallVM] ✅ Restore successful!');
        haptic.success();
        Alert.alert('Restore Complete', 'Your TripNode Premium subscription has been restored!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        console.log('[PaywallVM] ℹ️ No purchases found to restore');
        Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
      }
    } catch (error: any) {
      console.error('[PaywallVM] ❌ Restore error:', error);
      console.error('[PaywallVM] ❌ Error message:', error?.message);
      haptic.error();
      Alert.alert('Restore Failed', error?.message || 'Unable to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
      console.log('[PaywallVM] 🏁 Restore flow complete');
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
