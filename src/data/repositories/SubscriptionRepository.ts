import type { ISubscriptionRepository } from '@/domain/repositories/ISubscriptionRepository';
import type { Subscription } from '@/domain/entities/Subscription';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { REVENUECAT } from '@/lib/constants';

/**
 * Subscription repository implementation using RevenueCat
 */
export class SubscriptionRepository implements ISubscriptionRepository {
  async getSubscriptionStatus(_userId: string): Promise<Subscription> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return this.mapCustomerInfoToSubscription(customerInfo);
    } catch {
      // Return free tier on error
      return {
        isActive: false,
        tier: 'free',
        expiresAt: null,
        renewsAutomatically: false,
        productIdentifier: null,
        isExpired: false,
      };
    }
  }

  async purchasePackage(packageIdentifier: string): Promise<Subscription> {
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;

    if (!currentOffering) {
      throw new Error('No offerings available');
    }

    // Find the package by identifier
    const pkg = currentOffering.availablePackages.find(
      (p: PurchasesPackage) => p.identifier === packageIdentifier
    );

    if (!pkg) {
      throw new Error(`Package ${packageIdentifier} not found`);
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return this.mapCustomerInfoToSubscription(customerInfo);
  }

  async restorePurchases(): Promise<Subscription> {
    const customerInfo = await Purchases.restorePurchases();
    return this.mapCustomerInfoToSubscription(customerInfo);
  }

  private mapCustomerInfoToSubscription(customerInfo: CustomerInfo): Subscription {
    const entitlement = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO];
    const allEntitlement = customerInfo.entitlements.all[REVENUECAT.ENTITLEMENT_PRO];
    const isActive = !!entitlement;

    // Check if there was a previous subscription that expired
    const isExpired = !isActive && !!allEntitlement && !allEntitlement.isActive;

    return {
      isActive,
      tier: isActive ? 'pro' : 'free',
      expiresAt: entitlement?.expirationDate ?? allEntitlement?.expirationDate ?? null,
      renewsAutomatically: entitlement?.willRenew ?? false,
      productIdentifier: entitlement?.productIdentifier ?? null,
      isExpired,
    };
  }
}

// Singleton instance
export const subscriptionRepository = new SubscriptionRepository();
