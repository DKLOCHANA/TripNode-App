import React, { useEffect, useRef, ReactNode } from 'react';
import { Stack, useSegments, router } from 'expo-router';
import {
  ThemeProvider as NavigationThemeProvider,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { ScreenErrorBoundary } from '@/errors/errorBoundary';
import { revenueCatService } from '@/services/revenueCatService';
import { appsFlyerService } from '@/services/appsFlyerService';
import { REVENUECAT } from '@/lib/constants';
import { shouldEnableRevenueCat, shouldEnableAppsFlyer, logEnvironmentInfo } from '@/lib/environment';
import { configureNotificationHandler } from '@/services/notificationService';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';

function useAuthRedirect() {
  const { user, isHydrated, init } = useAuthStore();
  const segments = useSegments();
  const revenueCatInitialized = useRef(false);

  const { status: gateStatus } = useSubscriptionGate(user?.uid ?? null, isHydrated);

  // Boot-time side effects.
  useEffect(() => {
    logEnvironmentInfo();
    configureNotificationHandler();
  }, []);

  // Configure RevenueCat once. The gate hook handles identify/logout from here.
  useEffect(() => {
    if (revenueCatInitialized.current || !shouldEnableRevenueCat()) return;
    if (!REVENUECAT.API_KEY) {
      console.error('[App] RevenueCat API key is undefined');
      return;
    }
    revenueCatService.configure(REVENUECAT.API_KEY, REVENUECAT.TEST_API_KEY);
    revenueCatInitialized.current = true;
  }, []);

  // Initialize AppsFlyer SDK on app start (only if not in Expo Go)
  useEffect(() => {
    if (shouldEnableAppsFlyer()) {
      appsFlyerService.initSdk();
    }
  }, []);

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, []);

  // Routing: auth + hard paywall gate.
  //
  // States:
  //   - signed out                         → /(auth)/welcome
  //   - signed in, gate 'unknown'          → stay (loading splash)
  //   - signed in, gate 'pro'              → /(app)/plan
  //   - signed in, gate 'none'             → /paywall (cannot be dismissed)
  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    const isPaywall = segments[0] === 'paywall';
    const isIndex = !segments[0];

    if (!user) {
      if (!inAuthGroup) router.replace('/(auth)/welcome');
      return;
    }

    if (gateStatus === 'unknown') return;

    if (gateStatus === 'pro') {
      if (!inAppGroup) router.replace('/(app)/plan');
      return;
    }

    // gateStatus === 'none' — user must purchase to proceed
    if (!isPaywall) router.replace('/paywall');
    // touch isIndex so the linter sees it; harmless and documents intent
    void isIndex;
  }, [user, isHydrated, segments, gateStatus]);

  return { isHydrated, gateStatus, hasUser: !!user };
}

/**
 * React Navigation paints scene backgrounds, headers and the area behind the
 * (translucent) bottom tab bar using its own theme — NOT our app `colors`. With
 * no theme wired, expo-router falls back to the light default (white), so in
 * dark mode the translucent tab bar composited over white and the bottom strip
 * stayed white after toggling theme. Deriving the nav theme from our colors
 * keeps those navigator surfaces in sync with dark/light.
 */
function useNavigationTheme(): NavTheme {
  const { colors, isDark } = useTheme();
  const base = isDark ? NavDarkTheme : NavDefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      background: colors.backgroundPrimary,
      card: colors.backgroundPrimary,
      text: colors.textPrimary,
      border: colors.tabBarBorder,
      primary: colors.electricBlue,
      notification: colors.electricBlue,
    },
  };
}

function RootLayoutContent() {
  const { isHydrated, gateStatus, hasUser } = useAuthRedirect();
  const { colors, isDark } = useTheme();
  const navTheme = useNavigationTheme();

  // Show splash while auth hydrates, or while we resolve the subscription gate
  // for a signed-in user. This prevents a flash of the wrong screen.
  const showSplash = !isHydrated || (hasUser && gateStatus === 'unknown');

  return (
    <NavigationThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {showSplash ? (
        <View style={[styles.loading, { backgroundColor: colors.backgroundPrimary }]}>
          <ActivityIndicator size="large" color={colors.electricBlue} />
        </View>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.backgroundPrimary },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen
            name="paywall"
            options={{
              animation: 'fade',
              gestureEnabled: false,
            }}
          />
        </Stack>
      )}
    </NavigationThemeProvider>
  );
}

function ThemedGestureRoot({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
      {children}
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ScreenErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <ThemedGestureRoot>
              <RootLayoutContent />
            </ThemedGestureRoot>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
