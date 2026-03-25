import { useState, useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useHaptic } from '@/hooks/useHaptic';
import { revenueCatService } from '@/services/revenueCatService';
import { REVENUECAT } from '@/lib/constants';
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

  // Get plan name based on product identifier
  const getPlanName = useCallback(() => {
    if (!subscription.productIdentifier) return 'Premium Plan';
    
    if (subscription.productIdentifier.includes('annual') || subscription.productIdentifier.includes('yearly')) {
      return 'Annual Plan';
    } else if (subscription.productIdentifier.includes('monthly')) {
      return 'Monthly Plan';
    }
    return 'Premium Plan';
  }, [subscription.productIdentifier]);

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

  // Handle cancellation - redirects to App Store subscription management
  const handleCancelSubscription = useCallback(async () => {
    haptic.lightImpact();

    Alert.alert(
      'Cancel Subscription',
      'To cancel your subscription, you\'ll be redirected to your App Store subscription settings.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Continue',
          onPress: handleManageSubscription,
        },
      ]
    );
  }, [haptic, handleManageSubscription]);

  // Handle downgrade to free (same as cancel)
  const handleDowngradeToFree = useCallback(() => {
    haptic.lightImpact();

    Alert.alert(
      'Downgrade to Free',
      'Your Premium subscription will remain active until the end of your current billing period. After that, you\'ll be switched to the Free plan.\n\nYou\'ll be redirected to manage your subscription.',
      [
        { text: 'Keep Premium', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: handleManageSubscription,
        },
      ]
    );
  }, [haptic, handleManageSubscription]);

  // Handle renewing expired subscription
  const handleRenewSubscription = useCallback(() => {
    haptic.lightImpact();
    router.push('/paywall');
  }, [router, haptic]);

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
    expiryDate: subscription.formattedExpiryDate,
    renewsAutomatically: subscription.renewsAutomatically,
    daysUntilExpiry: subscription.daysUntilExpiry,
    isSubscriptionLoading: subscription.isLoading,

    // Loading states
    isLoading,

    // Actions
    handleManageSubscription,
    handleOpenCustomerCenter,
    handleCancelSubscription,
    handleDowngradeToFree,
    handleRenewSubscription,
    handleRestorePurchases,
    handleGoBack,
  };
}
