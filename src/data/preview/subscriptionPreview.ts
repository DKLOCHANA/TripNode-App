import { isExpoGoApp } from '@/lib/environment';
import type { Subscription } from '@/domain/entities/Subscription';

/**
 * Dev-only subscription preview data.
 *
 * RevenueCat's native module doesn't exist in Expo Go, so the subscription
 * screens (Profile premium card, Manage Subscription) have no plan/price/renewal
 * data to show there. This module supplies realistic sample values purely so the
 * UI can be developed in Expo Go.
 *
 * Hard-gated to `__DEV__` AND Expo Go:
 *   - Production builds: `__DEV__` is false → off.
 *   - EAS dev / TestFlight builds: not Expo Go → off (real RevenueCat is used).
 * So this can never affect a real build.
 */
export function shouldUsePreviewSubscription(): boolean {
  return __DEV__ && isExpoGoApp();
}

/** A future date (~11 months out) so "Renews <date>" reads naturally. */
function previewExpiryISO(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 11);
  return date.toISOString();
}

/** Sample active Pro subscription. `productIdentifier` includes "annual" so the
 *  existing plan-period heuristic resolves it to "Annual". */
export function getPreviewSubscription(): Subscription {
  return {
    isActive: true,
    tier: 'pro',
    expiresAt: previewExpiryISO(),
    renewsAutomatically: true,
    productIdentifier: 'preview_annual',
    isExpired: false,
  };
}

/** Price + period the Manage screen would otherwise read from RevenueCat
 *  offerings (which return nothing in Expo Go). */
export const PREVIEW_PRICE_LABEL = '$59.99/yr';
export const PREVIEW_PLAN_PERIOD: 'annual' | 'monthly' = 'annual';
