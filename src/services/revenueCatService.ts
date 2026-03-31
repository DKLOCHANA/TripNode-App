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
   * Uses test key in __DEV__ mode, production key in production builds
   */
  configure: (productionApiKey: string, testApiKey?: string): void => {
    // In development mode, use test key to avoid native store errors on simulator
    // In production mode, use production key for real App Store purchases
    const useTestKey = __DEV__ && !!testApiKey;
    const apiKey = useTestKey ? testApiKey : productionApiKey;
    
    console.log('[RevenueCat] 🔧 configure() called');
    console.log('[RevenueCat] 🔧 __DEV__:', __DEV__);
    console.log('[RevenueCat] 🔧 Using test key:', useTestKey);
    console.log('[RevenueCat] 🔧 API key prefix:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
    
    // Don't configure in Expo Go - it's not supported
    if (!shouldEnableRevenueCat()) {
      console.info('[RevenueCat] ⚠️ Skipping configuration - not available in Expo Go');
      return;
    }

    try {
      console.log('[RevenueCat] 📝 Setting log level to:', __DEV__ ? 'DEBUG' : 'INFO');
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
      
      console.log('[RevenueCat] 🚀 Calling Purchases.configure()...');
      Purchases.configure({ apiKey });
      isRevenueCatConfigured = true;
      console.info('[RevenueCat] ✅ Successfully configured' + (useTestKey ? ' (Test Store mode)' : ' (Production mode)'));
    } catch (error: any) {
      console.error('[RevenueCat] ❌ Failed to configure:', error);
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
    console.log('[RevenueCat] 👤 identify() called with userId:', userId);
    
    if (!isRevenueCatConfigured) {
      console.warn('[RevenueCat] ⚠️ identify: RevenueCat not configured (expected in Expo Go)');
      return null;
    }

    try {
      console.log('[RevenueCat] 👤 Logging in user...');
      const { customerInfo } = await Purchases.logIn(userId);
      
      console.log('[RevenueCat] ✅ User identified successfully');
      console.log('[RevenueCat] 👤 Customer info:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeSubscriptions: customerInfo.activeSubscriptions,
      });
      
      return customerInfo;
    } catch (error) {
      console.error('[RevenueCat] ❌ identify error:', error);
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
    console.log('[RevenueCat] 🎁 getOfferings() called');
    
    if (!isRevenueCatConfigured) {
      console.warn('[RevenueCat] ⚠️ getOfferings: RevenueCat not configured');
      return null;
    }

    try {
      console.log('[RevenueCat] 🔍 Fetching all offerings...');
      const offerings = await Purchases.getOfferings();
      
      console.log('[RevenueCat] 🎁 Offerings fetched:', {
        currentOfferingId: offerings.current?.identifier,
        totalOfferings: Object.keys(offerings.all).length,
        offeringIds: Object.keys(offerings.all),
      });
      
      return offerings;
    } catch (error) {
      console.error('[RevenueCat] ❌ getOfferings error:', error);
      console.error('[RevenueCat] ❌ Error details:', JSON.stringify(error, null, 2));
      return null;
    }
  },

  /**
   * Get available packages for purchase
   */
  getPackages: async (): Promise<PurchasesPackage[]> => {
    console.log('[RevenueCat] 📦 getPackages() called');
    console.log('[RevenueCat] 📦 isRevenueCatConfigured:', isRevenueCatConfigured);
    
    if (!isRevenueCatConfigured) {
      console.warn('[RevenueCat] ⚠️ getPackages: RevenueCat not configured');
      return [];
    }

    try {
      console.log('[RevenueCat] 🔍 Fetching offerings from RevenueCat...');
      const offerings = await Purchases.getOfferings();
      
      console.log('[RevenueCat] 📦 Offerings received:', {
        current: offerings.current?.identifier,
        allOfferingsCount: Object.keys(offerings.all).length,
        allOfferingIds: Object.keys(offerings.all),
      });
      
      const packages = offerings.current?.availablePackages ?? [];
      console.log('[RevenueCat] 📦 Available packages count:', packages.length);
      
      if (packages.length === 0) {
        console.warn('[RevenueCat] ⚠️ No packages available in current offering!');
        console.log('[RevenueCat] 📦 Current offering details:', offerings.current);
      } else {
        packages.forEach((pkg, index) => {
          console.log(`[RevenueCat] 📦 Package ${index + 1}:`, {
            identifier: pkg.identifier,
            packageType: pkg.packageType,
            productId: pkg.product.identifier,
            productTitle: pkg.product.title,
            price: pkg.product.priceString,
            priceAmount: pkg.product.price,
            currencyCode: pkg.product.currencyCode,
          });
        });
      }
      
      return packages;
    } catch (error) {
      console.error('[RevenueCat] ❌ getPackages error:', error);
      console.error('[RevenueCat] ❌ Error details:', JSON.stringify(error, null, 2));
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
    console.log('[RevenueCat] 💳 purchasePackage() called');
    console.log('[RevenueCat] 💳 Package details:', {
      identifier: pkg?.identifier,
      packageType: pkg?.packageType,
      productId: pkg?.product?.identifier,
      productTitle: pkg?.product?.title,
      price: pkg?.product?.priceString,
    });
    
    if (!isRevenueCatConfigured) {
      console.error('[RevenueCat] ❌ purchasePackage: RevenueCat not configured!');
      return null;
    }

    try {
      console.log('[RevenueCat] 💳 Initiating purchase...');
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      
      console.log('[RevenueCat] ✅ Purchase successful!');
      console.log('[RevenueCat] 💳 Customer info:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeSubscriptions: customerInfo.activeSubscriptions,
        entitlements: Object.keys(customerInfo.entitlements.active),
      });
      
      return customerInfo;
    } catch (error: any) {
      const isUserCancelled =
        error?.userCancelled === true ||
        error?.code === 'PURCHASE_CANCELLED' ||
        error?.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR ||
        String(error?.code) === '1';

      if (isUserCancelled) {
        console.log('[RevenueCat] ℹ️ Purchase cancelled by user');
        throw error;
      }

      // In dev mode with test store, test failures are expected
      const isTestStoreError = __DEV__ && error?.code === '5' && error?.message?.includes('Test purchase');
      
      if (isTestStoreError) {
        console.warn('[RevenueCat] ⚠️ Test Store purchase simulation:', error?.message);
      } else {
        console.error('[RevenueCat] ❌ purchasePackage error:', error);
        console.error('[RevenueCat] ❌ Error code:', error?.code);
        console.error('[RevenueCat] ❌ Error message:', error?.message);
        console.error('[RevenueCat] ❌ User cancelled:', error?.userCancelled);
      }
      throw error;
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
