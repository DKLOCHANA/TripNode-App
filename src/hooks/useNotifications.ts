import { useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { useNotificationStore } from '@/store/notificationStore';
import { useHaptic } from '@/hooks/useHaptic';
import {
  getPermissionStatus,
  requestPermission,
} from '@/services/notificationService';

/**
 * Profile-facing notification controls.
 *
 * Scheduling itself is owned by `useTripNotificationSync` (mounted app-wide):
 * this hook only manages the user's *preference* and the App Store-compliant
 * permission flow. The sync hook reacts to the preference change and schedules
 * / cancels accordingly.
 */
export function useNotifications() {
  const { enabled, isHydrated, hydrate, setEnabled } = useNotificationStore();
  const haptic = useHaptic();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);

  // If the preference says "on" but the OS permission was revoked (e.g. in
  // iOS Settings), reconcile so the toggle reflects reality.
  useEffect(() => {
    if (!isHydrated || !enabled) return;
    let active = true;
    getPermissionStatus().then((status) => {
      if (active && status !== 'granted') setEnabled(false);
    });
    return () => {
      active = false;
    };
  }, [isHydrated, enabled, setEnabled]);

  const enable = useCallback(async () => {
    const status = await getPermissionStatus();

    if (status === 'granted') {
      await setEnabled(true);
      haptic.success();
      return;
    }

    if (status === 'denied') {
      Alert.alert(
        'Notifications are off',
        'Trip reminders are disabled in iOS Settings. Turn them on to get departure and itinerary reminders.',
        [
          { text: 'Not Now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    // Undetermined — App Store-compliant priming alert before the OS prompt.
    Alert.alert(
      'Turn on trip reminders?',
      'TripNode will remind you before departure and the morning your trip begins. No spam — only what matters.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: async () => {
            const granted = await requestPermission();
            if (granted) {
              await setEnabled(true);
              haptic.success();
            } else {
              haptic.warning();
            }
          },
        },
      ]
    );
  }, [setEnabled, haptic]);

  const disable = useCallback(async () => {
    await setEnabled(false);
    haptic.lightImpact();
  }, [setEnabled, haptic]);

  const toggle = useCallback(
    (next: boolean) => {
      if (next) enable();
      else disable();
    },
    [enable, disable]
  );

  return {
    /** Effective preference shown on the Switch. */
    enabled,
    isHydrated,
    toggle,
  };
}
