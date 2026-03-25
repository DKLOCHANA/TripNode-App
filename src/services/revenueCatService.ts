import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PRODUCT_CATEGORY,
} from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { REVENUECAT } from '@/lib/constants';

export interface SubscriptionDetails {
  isActive: boolean;
  tier: 'free' | 'pro';
  expiresAt: string | null;
  renewsAutomatically: boolean;
  productIdentifier: string | null;
  isExpired: boolean;
}

/**
 * RevenueCat service wrapper for subscription management
 */
export const revenueCatService = {
  /**
   * Initialize RevenueCat SDK
   */
  configure: (apiKey: string): void => {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
    Purchases.configure({ apiKey });
  },

  /**
   * Identify user for subscription tracking
   */
  identify: async (userId: string): Promise<CustomerInfo> => {
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  },

  /**
   * Log out current user
   */
  logOut: async (): Promise<CustomerInfo> => {
    return Purchases.logOut();
  },

  /**
   * Get current customer info
   */
  getCustomerInfo: async (): Promise<CustomerInfo> => {
    return Purchases.getCustomerInfo();
  },

  /**
   * Get subscription details with expiry check
   */
  getSubscriptionDetails: async (): Promise<SubscriptionDetails> => {
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
  },

  /**
   * Check if user has active Pro subscription
   */
  isProSubscriber: async (): Promise<boolean> => {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined;
  },

  /**
   * Get all offerings
   */
  getOfferings: async (): Promise<PurchasesOfferings> => {
    return Purchases.getOfferings();
  },

  /**
   * Get available packages for purchase
   */
  getPackages: async (): Promise<PurchasesPackage[]> => {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  },

  /**
   * Get a specific package by identifier
   */
  getPackageByIdentifier: async (identifier: string): Promise<PurchasesPackage | null> => {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.identifier === identifier
    );
    return pkg ?? null;
  },

  /**
   * Purchase a subscription package
   */
  purchasePackage: async (pkg: PurchasesPackage): Promise<CustomerInfo> => {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  },

  /**
   * Purchase by package identifier
   */
  purchaseByIdentifier: async (packageIdentifier: string): Promise<CustomerInfo> => {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.identifier === packageIdentifier
    );

    if (!pkg) {
      throw new Error(`Package ${packageIdentifier} not found`);
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  },

  /**
   * Restore previous purchases
   */
  restorePurchases: async (): Promise<CustomerInfo> => {
    return Purchases.restorePurchases();
  },

  /**
   * Get subscription expiration date
   */
  getExpirationDate: async (): Promise<string | null> => {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO];
    return entitlement?.expirationDate ?? null;
  },

  /**
   * Check if subscription is about to expire (within 7 days)
   */
  isSubscriptionExpiringSoon: async (): Promise<boolean> => {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO];
    
    if (!entitlement?.expirationDate || entitlement.willRenew) {
      return false;
    }

    const expirationDate = new Date(entitlement.expirationDate);
    const now = new Date();
    const daysUntilExpiry = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  },

  /**
   * Present RevenueCat Paywall UI
   */
  presentPaywall: async (): Promise<{ customerInfo: CustomerInfo | null; purchaseMade: boolean }> => {
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
      throw error;
    }
  },

  /**
   * Present RevenueCat Paywall UI with specific offering
   */
  presentPaywallWithOffering: async (
    offeringIdentifier: string
  ): Promise<{ customerInfo: CustomerInfo | null; purchaseMade: boolean }> => {
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
      throw error;
    }
  },

  /**
   * Present paywall only if user doesn't have the required entitlement
   */
  presentPaywallIfNeeded: async (): Promise<{ customerInfo: CustomerInfo | null; purchaseMade: boolean }> => {
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
      throw error;
    }
  },

  /**
   * Present Customer Center for subscription management
   */
  presentCustomerCenter: async (): Promise<void> => {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add listener for customer info updates
   * Returns a function to remove the listener
   */
  addCustomerInfoUpdateListener: (
    listener: (customerInfo: CustomerInfo) => void
  ): (() => void) => {
    Purchases.addCustomerInfoUpdateListener(listener);
    // Return a cleanup function to remove the listener
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  },

  /**
   * Get management URL for subscription (iOS App Store / Google Play)
   */
  getManagementURL: async (): Promise<string | null> => {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.managementURL;
  },

  /**
   * Check if there's an active subscription that can be cancelled
   */
  canCancelSubscription: async (): Promise<boolean> => {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO];
    return !!entitlement && entitlement.willRenew;
  },
};

export default revenueCatService;
