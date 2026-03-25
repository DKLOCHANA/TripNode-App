import Constants from 'expo-constants';

/**
 * Detect if app is running in Expo Go (development preview)
 * Expo Go does not support native modules like RevenueCat
 */
export function isExpoGoApp(): boolean {
  return (
    Constants.appOwnership === 'expo' ||
    !Constants.expoConfig?.plugins?.some((plugin: any) =>
      plugin === 'expo-build-properties' || 
      (Array.isArray(plugin) && plugin[0] === 'expo-build-properties')
    )
  );
}

/**
 * Detect if app is running in a production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || !__DEV__;
}

/**
 * Determine if RevenueCat should be enabled
 * - Disabled in Expo Go (no native support)
 * - Enabled in development builds and production
 */
export function shouldEnableRevenueCat(): boolean {
  return !isExpoGoApp();
}

/**
 * Log environment info for debugging
 */
export function logEnvironmentInfo(): void {
  console.info('[Environment]', {
    isExpoGo: isExpoGoApp(),
    isProduction: isProduction(),
    shouldEnableRevenueCat: shouldEnableRevenueCat(),
    appOwnership: Constants.appOwnership,
    buildNumber: Constants.expoConfig?.version,
  });
}
