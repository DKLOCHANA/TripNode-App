import Constants from 'expo-constants';

/**
 * Detect if app is running in Expo Go (development preview)
 * Expo Go does not support native modules like RevenueCat
 */
export function isExpoGoApp(): boolean {
  // More reliable detection: Expo Go always has appOwnership === 'expo'
  // Development builds and production builds have appOwnership === null or undefined
  const isExpoGo = Constants.appOwnership === 'expo';
  
  console.log('[Environment] 🔍 isExpoGoApp check:', {
    appOwnership: Constants.appOwnership,
    executionEnvironment: Constants.executionEnvironment,
    isExpoGo,
  });
  
  return isExpoGo;
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
  const isExpoGo = isExpoGoApp();
  const shouldEnable = !isExpoGo;
  
  console.log('[Environment] 🔧 shouldEnableRevenueCat:', {
    isExpoGo,
    shouldEnable,
  });
  
  return shouldEnable;
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
    executionEnvironment: Constants.executionEnvironment,
    buildNumber: Constants.expoConfig?.version,
  });
}
