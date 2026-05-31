import { useEffect, useState, useCallback, useRef } from 'react';
import type { CustomerInfo } from 'react-native-purchases';
import { useQueryClient } from '@tanstack/react-query';
import { revenueCatService } from '@/services/revenueCatService';
import { appsFlyerService } from '@/services/appsFlyerService';
import { shouldEnableRevenueCat } from '@/lib/environment';
import { REVENUECAT } from '@/lib/constants';
import { queryKeys } from '@/lib/queryKeys';

export type GateStatus = 'unknown' | 'pro' | 'none';

function statusFromCustomerInfo(info: CustomerInfo | null): GateStatus {
  if (!info) return 'none';
  return info.entitlements.active[REVENUECAT.ENTITLEMENT_PRO] !== undefined ? 'pro' : 'none';
}

/**
 * Link the signed-in user across AppsFlyer and RevenueCat:
 *  - `setCustomerUserId` attributes AppsFlyer events to this user.
 *  - cross-linking the AppsFlyer device ID into RevenueCat lets subscription
 *    revenue be attributed back to the original install/campaign (the RC ↔
 *    AppsFlyer server-to-server integration).
 *
 * Fire-and-forget and fully isolated: attribution is best-effort and must
 * never throw into or delay the subscription gate.
 */
function linkAppsFlyerIdentity(userId: string): void {
  appsFlyerService.setCustomerUserId(userId);
  appsFlyerService
    .getUID()
    .then((appsFlyerUID) =>
      appsFlyerUID ? revenueCatService.setAppsflyerID(appsFlyerUID) : undefined
    )
    .catch(() => {
      // Best-effort attribution — swallow so the gate is unaffected.
    });
}

/**
 * Owns the hard-paywall gate state for the signed-in user.
 *
 * - In Expo Go (no native RevenueCat), the gate auto-resolves to 'pro' so devs
 *   are not locked out during local development.
 * - For real builds, the gate is resolved by identifying the user with
 *   RevenueCat and inspecting the Pro entitlement, and it stays live via the
 *   customer-info update listener so cancellations/expirations re-gate the app
 *   without a relaunch.
 */
export function useSubscriptionGate(userId: string | null, isHydrated: boolean) {
  const [status, setStatus] = useState<GateStatus>('unknown');
  const previousUserId = useRef<string | null>(null);
  const isIdentifying = useRef(false);
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    if (!shouldEnableRevenueCat()) {
      setStatus(userId ? 'pro' : 'unknown');
      return;
    }
    const info = await revenueCatService.getCustomerInfo();
    setStatus(statusFromCustomerInfo(info));
  }, [userId]);

  // Resolve gate when user changes
  useEffect(() => {
    if (!isHydrated) return;

    if (!userId) {
      setStatus('unknown');
      previousUserId.current = null;
      return;
    }

    if (!shouldEnableRevenueCat()) {
      setStatus('pro');
      previousUserId.current = userId;
      return;
    }

    if (userId === previousUserId.current || isIdentifying.current) return;

    isIdentifying.current = true;
    setStatus('unknown');

    revenueCatService
      .identify(userId)
      .then((info) => {
        previousUserId.current = userId;
        setStatus(statusFromCustomerInfo(info));
        linkAppsFlyerIdentity(userId);
      })
      .catch((error: any) => {
        // Rate limiting (7638) — fall back to a fresh getCustomerInfo so we
        // still resolve the gate instead of leaving the user stuck on a
        // loading screen.
        if (error?.info?.backendErrorCode === 7638) {
          revenueCatService.getCustomerInfo().then((info) => {
            previousUserId.current = userId;
            setStatus(statusFromCustomerInfo(info));
            linkAppsFlyerIdentity(userId);
          });
          return;
        }
        // Identify failed for a real reason — default to gated. Restore
        // Purchases on the paywall is the recovery path.
        setStatus('none');
      })
      .finally(() => {
        isIdentifying.current = false;
      });
  }, [userId, isHydrated]);

  // Keep gate live via customer-info updates (purchases, cancellations,
  // expirations, auto-renewals) so the app re-gates without a relaunch. Also
  // invalidate the subscription query so downstream consumers (e.g. the
  // renewal-reminder scheduler) pick up the new expiration date.
  useEffect(() => {
    if (!userId || !shouldEnableRevenueCat()) return;

    const unsubscribe = revenueCatService.addCustomerInfoUpdateListener((info) => {
      setStatus(statusFromCustomerInfo(info));
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status(userId) });
    });
    return unsubscribe;
  }, [userId, queryClient]);

  // Log the user out of RevenueCat when our auth user disappears.
  useEffect(() => {
    if (userId || !shouldEnableRevenueCat() || !previousUserId.current) return;
    revenueCatService.logOut().catch(() => {});
    previousUserId.current = null;
  }, [userId]);

  return { status, refresh };
}
