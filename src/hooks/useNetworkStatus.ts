import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
}

/**
 * Hook to monitor network connectivity status in real-time.
 * 
 * Usage:
 * ```typescript
 * const { isConnected, isInternetReachable, checkConnection } = useNetworkStatus();
 * 
 * if (!isConnected) {
 *   // Show offline state
 * }
 * ```
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
  });

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Manually check the current network connection status.
   * Useful for refreshing connection state before an action.
   */
  const checkConnection = useCallback(async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    setNetworkStatus({
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    });
    return state.isConnected === true && state.isInternetReachable !== false;
  }, []);

  return {
    ...networkStatus,
    checkConnection,
  };
}
