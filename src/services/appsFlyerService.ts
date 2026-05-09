import appsFlyer from 'react-native-appsflyer';
import { Platform } from 'react-native';
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
  PermissionStatus,
} from 'expo-tracking-transparency';
import { APPSFLYER } from '@/lib/constants';
import { shouldEnableAppsFlyer } from '@/lib/environment';

type RegistrationMethod = 'email' | 'apple';

let isInitialized = false;

/**
 * AppsFlyer event tracking service.
 *
 * Handles SDK initialization (with ATT wait on iOS), the ATT permission
 * prompt, SKAN fallback, user identification, and in-app event logging.
 */
export const appsFlyerService = {
  /**
   * Initialize the AppsFlyer SDK.
   * Must be called once on app start, before any events are logged.
   * On iOS the SDK will defer the install event until ATT status is resolved
   * or the configured timeout expires (whichever comes first).
   */
  initSdk: async (): Promise<void> => {
    if (isInitialized || !shouldEnableAppsFlyer()) {
      return;
    }

    if (!APPSFLYER.DEV_KEY) {
      console.error('[AppsFlyer] Dev key is not configured');
      return;
    }

    try {
      await appsFlyer.initSdk({
        devKey: APPSFLYER.DEV_KEY,
        isDebug: __DEV__,
        appId: APPSFLYER.APP_ID,
        onInstallConversionDataListener: true,
        onDeepLinkListener: false,
        ...(Platform.OS === 'ios' && {
          timeToWaitForATTUserAuthorization: APPSFLYER.ATT_TIMEOUT_SECONDS,
        }),
      });

      isInitialized = true;

      if (__DEV__) {
        console.log('[AppsFlyer] SDK initialized successfully');
      }
    } catch (error) {
      console.error('[AppsFlyer] Failed to initialize SDK:', error);
    }
  },

  /**
   * Whether the SDK has been successfully initialized.
   */
  isReady: (): boolean => isInitialized,

  /**
   * Request ATT (App Tracking Transparency) permission on iOS.
   * On non-iOS platforms this is a no-op that returns 'granted'.
   * When the user responds, the AppsFlyer SDK (which was initialized with
   * `timeToWaitForATTUserAuthorization`) automatically picks up the status.
   */
  requestTrackingPermission: async (): Promise<PermissionStatus> => {
    if (Platform.OS !== 'ios') {
      return PermissionStatus.GRANTED;
    }

    try {
      const { status } = await requestTrackingPermissionsAsync();

      if (__DEV__) {
        console.log('[AppsFlyer] ATT permission status:', status);
      }

      return status;
    } catch (error) {
      console.error('[AppsFlyer] Failed to request tracking permission:', error);
      return PermissionStatus.DENIED;
    }
  },

  /**
   * Check the current ATT permission status without prompting.
   */
  getTrackingStatus: async (): Promise<PermissionStatus> => {
    if (Platform.OS !== 'ios') {
      return PermissionStatus.GRANTED;
    }

    try {
      const { status } = await getTrackingPermissionsAsync();
      return status;
    } catch (error) {
      console.error('[AppsFlyer] Failed to get tracking status:', error);
      return PermissionStatus.UNDETERMINED;
    }
  },

  /**
   * Retrieve the unique AppsFlyer device ID.
   * Required by RevenueCat to link subscription events back to AppsFlyer.
   */
  getUID: (): Promise<string | null> => {
    if (!isInitialized) return Promise.resolve(null);

    return new Promise((resolve) => {
      appsFlyer.getAppsFlyerUID((error, uid) => {
        if (error) {
          console.error('[AppsFlyer] Failed to get AppsFlyer UID:', error);
          resolve(null);
        } else {
          resolve(uid ?? null);
        }
      });
    });
  },

  /**
   * Associate the current device with a customer user ID.
   * Call after the user has signed in or registered.
   */
  setCustomerUserId: (userId: string): void => {
    if (!isInitialized) return;

    try {
      appsFlyer.setCustomerUserId(userId);

      if (__DEV__) {
        console.log('[AppsFlyer] Customer user ID set:', userId);
      }
    } catch (error) {
      console.error('[AppsFlyer] Failed to set customer user ID:', error);
    }
  },

  /**
   * Log the `af_complete_registration` standard event.
   */
  trackRegistration: (method: RegistrationMethod): void => {
    if (!isInitialized) {
      if (__DEV__) {
        console.warn('[AppsFlyer] SDK not initialized – skipping trackRegistration');
      }
      return;
    }

    try {
      appsFlyer.logEvent('af_complete_registration', {
        af_registration_method: method,
      });

      if (__DEV__) {
        console.log('[AppsFlyer] Tracked af_complete_registration:', method);
      }
    } catch (error) {
      console.error('[AppsFlyer] Failed to log registration event:', error);
    }
  },

  /**
   * Log a custom in-app event.
   */
  logEvent: (eventName: string, eventValues: Record<string, string | number> = {}): void => {
    if (!isInitialized) return;

    try {
      appsFlyer.logEvent(eventName, eventValues);

      if (__DEV__) {
        console.log('[AppsFlyer] Event logged:', eventName, eventValues);
      }
    } catch (error) {
      console.error('[AppsFlyer] Failed to log event:', eventName, error);
    }
  },
};

export default appsFlyerService;
