import type { Subscription } from '../entities/Subscription';

export interface ISubscriptionRepository {
  /**
   * Check if the current user has an active Pro entitlement.
   */
  getSubscriptionStatus(userId: string): Promise<Subscription>;

  /**
   * Trigger the App Store purchase flow for the given package.
   * Resolves with updated status on success.
   */
  purchasePackage(packageIdentifier: string): Promise<Subscription>;

  /**
   * Restore previous purchases — required by App Store guidelines.
   */
  restorePurchases(): Promise<Subscription>;
}
