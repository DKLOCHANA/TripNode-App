import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PRODUCT_CATEGORY,
} from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { REVENUECAT } from '@/lib/constants';
import { shouldEnableRevenueCat } from '@/lib/environment';

export interface SubscriptionDetails {
  isActive: boolean;
  tier: 'free' | 'pro';
  expiresAt: string | null;
  renewsAutomatically: boolean;
  productIdentifier: string | null;
  isExpired: boolean;
}

// Track if RevenueCat has been successfully configured
let isRevenueCatConfigured = false;

/**
 * RevenueCat service wrapper for subscription management
 * Gracefully handles Expo Go where native modules aren't available
 */
export const revenueCatService = {
  /**
   * Initialize RevenueCat SDK
   * Safely skipped in Expo Go
   */
  configure: (apiKey: string): void => {
    // Don't configure in Expo Go - it's not supported
    if (!shouldEnableRevenueCat()) {
      console.info('[RevenueCat] Skipping configuration - not available in Expo Go');
      return;
    }

    try {
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
      Purchases.configure({ apiKey });
      isRevenueCatConfigured = true;
      console.info('[RevenueCat] Successfully configured');
    } catch (error) {
      console.warn('[RevenueCat] Failed to configure:', error);
      isRevenueCatConfigured = false;
    }
  },

  /**
   * Check if RevenueCat is properly configured
   */
  isConfigured: (): boolean => {
    return isRevenueCatConfigured;
  },

  /**
   * Identify user for subscription tracking
   */
  identify: async (userId: string): Promise<CustomerInfo | null> => {
    if (!isRevenueCatConfigured) {
      console.warn('[RevenueCat] identify: RevenueCat not configured (expected in Expo Go)');
      return null;
    }

    try {
      const { customerInfo } = await Purchases.logIn(userId);
      return customerInfo;
    } catch (error) {
      console.warn('[RevenueCat] identify error:', error);
      return null;
    }
  },

  /**
   * Log out current user
   */
  logOut: async (): Promise<CustomerInfo | null> => {
    if (!isRevenueCatConfigured) {
      console.warn('[RevenueCat] logOut: RevenueCat not configured (expected in Expo Go)');
      return null;
    }

    try {
      return await Purchases.logOut();
    } catch (error) {
      console.warn('[RevenueCat] logOut error:', error);
      return null;
    }
  },

  /**
   * Get current customer info
   */
  getCustomerInfo: async (): Promise<CustomerInfo | null> => {
    if (!isRevenueCatConfigured) {
      console.warn('[RevenueCat] getCustomerInfo: RevenueCat not configured (expected in Expo Go)');
      return null;
    }

    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.warn('[RevenueCat] getCustomerInfo error:', error);
      return null;
    }
  },

  /**
   * Get subscription details with expiry check
   */
  getSubscriptionDetails: async (): Promise<SubscriptionDetails> => {
    if (!isRevenueCatConfigured) {
      return {
        isActive: false,
        tier: 'free',
        expiresAt: null,
        renewsAutomatically: false,
        productIdentifier: null,
        isExpired: false,
      };
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO];
      const isActive = !!entitlement;

      // Check if there was a previous subscription that expired
      const allEntitlements = customerInfo.entitlements.all[REVENUECAT.ENTITLEMENT_PRO];
      const isExpired = !isActive && !!allEntitlements && !allEntitlements.isActive;

      return {
        isActive,
        tier: isActive ? 'pro' : 'free',
        expiresAt: entitlement?.expirationDate ?? allEntitlements?.expirationDate ?? null,
        renewsAutomatically: entitlement?.willRenew ?? false,
        productIdentifier: entitlement?.productIdentifier ?? null,
        isExpired,
      };
    } catch (error) {
      console.warn('[RevenueCat] getSubscriptionDetails error:', error);
      return {
        isActive: false,
        tier: 'free',
        expiresAt: null,
        renewsAutomatically: false,
        productIdentifier: null,
        isExpired: false,
      };
    }
  },

  /**
   * Check if user has active Pro subscription
   */
  isProSubscriber: async (): Promise<boolean> => {
    if (!isRevenueCatConfigured) return false;

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;
    } catch (error) {
      console.warn('[RevenueCat] isProSubscriber error:', error);
      return false;
    }
  },

  /**
   * Get all offerings
   */
  getOfferings: async (): Promise<PurchasesOfferings | null> => {
    if (!isRevenueCatConfigured) return null;

    try {
      return await Purchases.getOfferings();
    } catch (error) {
      console.warn('[RevenueCat] getOfferings error:', error);
      return null;
    }
  },

  /**
   * Get available packages for purchase
   */
  getPackages: async (): Promise<PurchasesPackage[]> => {
    if (!isRevenueCatConfigured) return [];

    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages ?? [];
    } catch (error) {
      console.warn('[RevenueCat] getPackages error:', error);
      return [];
    }
  },

  /**
   * Get a specific package by identifier
   */
  getPackageByIdentifier: async (identifier: string): Promise<PurchasesPackage | null> => {
    if (!isRevenueCatConfigured) return null;

    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        (p) => p.identifier === identifier
      );
      return pkg ?? null;
    } catch (error) {
      console.warn('[RevenueCat] getPackageByIdentifier error:', error);
      return null;
    }
  },

  /**
   * Purchase a subscription package
   */
  purchasePackage: async (pkg: PurchasesPackage): Promise<CustomerInfo | null> => {
    if (!isRevenueCatConfigured) return null;

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    } catch (error) {
      console.warn('[RevenueCat] purchasePackage error:', error);
      return null;
    }
  },

  /**
   * Purchase by package identifier
   */
  purchaseByIdentifier: async (packageIdentifier: string): Promise<CustomerInfo | null> => {
    if (!isRevenueCatConfigured) return null;

    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        (p) => p.identifier === packageIdentifier
      );

      if (!pkg) {
        throw new Error(`Package ${packageIdentifier} not found`);
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    } catch (error) {
      console.warn('[RevenueCat] purchaseByIdentifier error:', error);
      return null;
    }
  },

  /**
   * Restore previous purchases
   */
  restorePurchases: async (): Promise<CustomerInfo | null> => {
    if (!isRevenueCatConfigured) return null;

    try {
      return await Purchases.restorePurchases();
    } catch (error) {
      console.warn('[RevenueCat] restorePurchases error:', error);
      return null;
    }
  },

  /**
   * Get subscription expiration date
   */
  getExpirationDate: async (): Promise<string | null> => {
    if (!isRevenueCatConfigured) return null;

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO];
      return entitlement?.expirationDate ?? null;
    } catch (error) {
      console.warn('[RevenueCat] getExpirationDate error:', error);
      return null;
    }
  },

  /**
   * Check if subscription is about to expire (within 7 days)
   */
  isSubscriptionExpiringSoon: async (): Promise<boolean> => {
    if (!isRevenueCatConfigured) return false;

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO];
      
      if (!entitlement?.expirationDate || entitlement.willRenew) {
        return false;
      }

      const expirationDate = new Date(entitlement.expirationDate);
      const now = new Date();
      const daysUntilExpiry = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    } catch (error) {
      console.warn('[RevenueCat] isSubscriptionExpiringSoon error:', error);
      return false;
    }
  },

  /**
   * Present RevenueCat Paywall UI
   */
  presentPaywall: async (): Promise<{ customerInfo: CustomerInfo | null; purchaseMade: boolean }> => {
    if (!isRevenueCatConfigured) {
      return { customerInfo: null, purchaseMade: false };
    }

    try {
      const paywallResult = await RevenueCatUI.presentPaywall();
      // After paywall closes, check customer info
      const customerInfo = await Purchases.getCustomerInfo();
      const purchaseMade = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;
      return {
        customerInfo,
        purchaseMade,
      };
    } catch (error) {
      console.warn('[RevenueCat] presentPaywall error:', error);
      return { customerInfo: null, purchaseMade: false };
    }
  },

  /**
   * Present RevenueCat Paywall UI with specific offering
   */
  presentPaywallWithOffering: async (
    offeringIdentifier: string
  ): Promise<{ customerInfo: CustomerInfo | null; purchaseMade: boolean }> => {
    if (!isRevenueCatConfigured) {
      return { customerInfo: null, purchaseMade: false };
    }

    try {
      const offerings = await Purchases.getOfferings();
      const offering = offerings.all[offeringIdentifier];
      
      if (!offering) {
        throw new Error(`Offering ${offeringIdentifier} not found`);
      }

      await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: REVENUECAT.ENTITLEMENT_PRO,
      });
      
      // After paywall closes, check customer info
      const customerInfo = await Purchases.getCustomerInfo();
      const purchaseMade = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;
      return {
        customerInfo,
        purchaseMade,
      };
    } catch (error) {
      console.warn('[RevenueCat] presentPaywallWithOffering error:', error);
      return { customerInfo: null, purchaseMade: false };
    }
  },

  /**
   * Present paywall only if user doesn't have the required entitlement
   */
  presentPaywallIfNeeded: async (): Promise<{ customerInfo: CustomerInfo | null; purchaseMade: boolean }> => {
    if (!isRevenueCatConfigured) {
      return { customerInfo: null, purchaseMade: false };
    }

    try {
      await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: REVENUECAT.ENTITLEMENT_PRO,
      });
      
      // After paywall closes, check customer info
      const customerInfo = await Purchases.getCustomerInfo();
      const purchaseMade = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;
      return {
        customerInfo,
        purchaseMade,
      };
    } catch (error) {
      console.warn('[RevenueCat] presentPaywallIfNeeded error:', error);
      return { customerInfo: null, purchaseMade: false };
    }
  },

  /**
   * Present Customer Center for subscription management
   */
  presentCustomerCenter: async (): Promise<void> => {
    if (!isRevenueCatConfigured) return;

    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (error) {
      console.warn('[RevenueCat] presentCustomerCenter error:', error);
    }
  },

  /**
   * Add listener for customer info updates
   * Returns a function to remove the listener
   */
  addCustomerInfoUpdateListener: (
    listener: (customerInfo: CustomerInfo) => void
  ): (() => void) => {
    if (!isRevenueCatConfigured) {
      return () => {}; // Return no-op cleanup function
    }

    try {
      Purchases.addCustomerInfoUpdateListener(listener);
      // Return a cleanup function to remove the listener
      return () => {
        Purchases.removeCustomerInfoUpdateListener(listener);
      };
    } catch (error) {
      console.warn('[RevenueCat] addCustomerInfoUpdateListener error:', error);
      return () => {};
    }
  },

  /**
   * Get management URL for subscription (iOS App Store / Google Play)
   */
  getManagementURL: async (): Promise<string | null> => {
    if (!isRevenueCatConfigured) return null;

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.managementURL;
    } catch (error) {
      console.warn('[RevenueCat] getManagementURL error:', error);
      return null;
    }
  },

  /**
   * Check if there's an active subscription that can be cancelled
   */
  canCancelSubscription: async (): Promise<boolean> => {
    if (!isRevenueCatConfigured) return false;

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO];
      return !!entitlement && entitlement.willRenew;
    } catch (error) {
      console.warn('[RevenueCat] canCancelSubscription error:', error);
      return false;
    }
  },
};

export default revenueCatService;
