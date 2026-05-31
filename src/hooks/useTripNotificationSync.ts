import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useTrips } from '@/hooks/useTrips';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import {
  scheduleAll,
  cancelAll,
  getPermissionStatus,
  type RenewalReminderInput,
} from '@/services/notificationService';

/**
 * App-wide notification scheduler. Mount once inside the authenticated layout.
 *
 * Single source of truth for *when* notifications get (re)scheduled:
 *   • whenever the saved-trips list changes
 *   • whenever subscription expiration / renewal changes
 *   • on app foreground (data/time may have moved on)
 * It also reconciles a revoked OS permission by flipping the stored preference
 * off, so the Profile toggle never lies.
 */
export function useTripNotificationSync() {
  const userId = useAuthStore((s) => s.user?.uid);
  const { enabled, isHydrated, hydrate } = useNotificationStore();
  const { data: trips } = useTrips(userId);
  const subscription = useSubscriptionStatus();
  const syncing = useRef(false);

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);

  const reconcileAndSchedule = useRef(async () => {});

  reconcileAndSchedule.current = async () => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      const { enabled: pref } = useNotificationStore.getState();
      if (!pref) {
        await cancelAll();
        return;
      }
      const status = await getPermissionStatus();
      if (status !== 'granted') {
        // Permission was revoked in Settings — keep UI honest, stop scheduling.
        await useNotificationStore.getState().setEnabled(false);
        await cancelAll();
        return;
      }

      const renewal: RenewalReminderInput | null =
        subscription.isPro && subscription.expiresAt
          ? {
              expirationDate: new Date(subscription.expiresAt),
              willRenew: subscription.renewsAutomatically,
              productIdentifier: subscription.productIdentifier,
            }
          : null;

      await scheduleAll(trips ?? [], renewal);
    } finally {
      syncing.current = false;
    }
  };

  // Re-run whenever the preference, the trips list, or the subscription
  // expiration/renewal flag changes.
  useEffect(() => {
    if (!isHydrated) return;
    reconcileAndSchedule.current();
  }, [
    isHydrated,
    enabled,
    trips,
    subscription.isPro,
    subscription.expiresAt,
    subscription.renewsAutomatically,
    subscription.productIdentifier,
  ]);

  // Re-run on app foreground.
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active') reconcileAndSchedule.current();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);
}
