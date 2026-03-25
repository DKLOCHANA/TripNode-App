import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

/**
 * User-friendly messages for network connectivity issues.
 */
export const NETWORK_MESSAGES = {
  NO_CONNECTION: {
    title: 'No Internet Connection',
    message: 'Please check your internet connection and try again.',
  },
  WEAK_CONNECTION: {
    title: 'Weak Connection',
    message: 'Your internet connection appears to be unstable. Please try again.',
  },
} as const;

/**
 * Check if the device has an active internet connection.
 * Returns true if connected, false otherwise.
 */
export async function isNetworkAvailable(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch {
    return false;
  }
}

/**
 * Check network connectivity and show a user-friendly alert if offline.
 * Use this before any network-dependent button action.
 * 
 * @returns true if network is available, false if not (and alert was shown)
 * 
 * Usage:
 * ```typescript
 * const handleSubmit = async () => {
 *   if (!(await checkNetworkAndAlert())) return;
 *   // proceed with network operation
 * };
 * ```
 */
export async function checkNetworkAndAlert(): Promise<boolean> {
  const isAvailable = await isNetworkAvailable();
  
  if (!isAvailable) {
    Alert.alert(
      NETWORK_MESSAGES.NO_CONNECTION.title,
      NETWORK_MESSAGES.NO_CONNECTION.message,
      [{ text: 'OK', style: 'default' }]
    );
    return false;
  }
  
  return true;
}

/**
 * Wrapper function to execute an action only if network is available.
 * Shows an alert if offline and does not execute the action.
 * 
 * @param action - The async function to execute if network is available
 * @param onOffline - Optional callback when offline (after alert is shown)
 * @returns The result of the action, or undefined if offline
 * 
 * Usage:
 * ```typescript
 * const handleLogin = () => withNetworkCheck(
 *   async () => {
 *     await signIn(email, password);
 *   },
 *   () => haptic.error()
 * );
 * ```
 */
export async function withNetworkCheck<T>(
  action: () => Promise<T>,
  onOffline?: () => void
): Promise<T | undefined> {
  const isAvailable = await checkNetworkAndAlert();
  
  if (!isAvailable) {
    onOffline?.();
    return undefined;
  }
  
  return action();
}
