import { create } from 'zustand';
import { AsyncStorageService } from '@/data/sources/local/asyncStorage';

/**
 * Notification preference (the user's intent).
 *
 * The effective state is `enabled && OS-permission-granted` — this store only
 * holds the user's chosen preference; the hook reconciles it with the real OS
 * permission on every app foreground.
 */

const STORAGE_KEY = 'tripnode_notifications_enabled';

interface NotificationState {
  /** True once the persisted preference has been read from storage. */
  isHydrated: boolean;
  /** The user's preference (independent of OS permission). */
  enabled: boolean;
  hydrate: () => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isHydrated: false,
  enabled: false,

  hydrate: async () => {
    try {
      const flag = await AsyncStorageService.getItem(STORAGE_KEY);
      set({ enabled: flag === 'true', isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  setEnabled: async (enabled) => {
    set({ enabled });
    try {
      await AsyncStorageService.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    } catch {
      // Non-fatal — worst case the preference resets next launch.
    }
  },
}));
