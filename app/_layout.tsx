import React, { useEffect, useRef, ReactNode } from 'react';
import { Stack, useSegments, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { ScreenErrorBoundary } from '@/errors/errorBoundary';
import { revenueCatService } from '@/services/revenueCatService';
import { REVENUECAT } from '@/lib/constants';
import { queryKeys } from '@/lib/queryKeys';
import { shouldEnableRevenueCat, logEnvironmentInfo } from '@/lib/environment';

function useAuthRedirect() {
  const { user, isHydrated, init } = useAuthStore();
  const segments = useSegments();
  const revenueCatInitialized = useRef(false);
  const previousUserId = useRef<string | null>(null);
  const isIdentifying = useRef(false); // Prevent concurrent identify calls

  // Log environment info on first render
  useEffect(() => {
    logEnvironmentInfo();
  }, []);

  // Initialize RevenueCat SDK on app start (only if not in Expo Go)
  useEffect(() => {
    console.log('[App] 🚀 RevenueCat initialization check...');
    console.log('[App] 🔑 Production API_KEY exists:', !!REVENUECAT.API_KEY);
    console.log('[App] 🔑 Test API_KEY exists:', !!REVENUECAT.TEST_API_KEY);
    console.log('[App] ✅ shouldEnableRevenueCat():', shouldEnableRevenueCat());
    console.log('[App] ✅ Already initialized:', revenueCatInitialized.current);
    
    if (!revenueCatInitialized.current && shouldEnableRevenueCat()) {
      console.log('[App] 🚀 Configuring RevenueCat...');
      try {
        if (!REVENUECAT.API_KEY) {
          console.error('[App] ❌ RevenueCat API key is undefined!');
          return;
        }
        // Pass both production and test keys - service will try production first,
        // fall back to test key if native store is unavailable
        revenueCatService.configure(REVENUECAT.API_KEY, REVENUECAT.TEST_API_KEY);
        revenueCatInitialized.current = true;
        console.log('[App] ✅ RevenueCat initialization completed');
      } catch (error) {
        console.error('[App] ❌ Failed to configure RevenueCat:', error);
        revenueCatInitialized.current = false;
      }
    } else {
      console.log('[App] ⏭️ Skipping RevenueCat initialization');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, []);

  // Identify user with RevenueCat when user changes
  useEffect(() => {
    const identifyUser = async () => {
      console.log('[App] 👤 identifyUser check...');
      console.log('[App] 👤 isIdentifying:', isIdentifying.current);
      console.log('[App] 👤 shouldEnableRevenueCat:', shouldEnableRevenueCat());
      console.log('[App] 👤 user exists:', !!user);
      console.log('[App] 👤 previousUserId:', previousUserId.current);
      
      // Skip if already identifying, user hasn't changed, or RevenueCat not available
      if (isIdentifying.current || !shouldEnableRevenueCat()) {
        console.log('[App] ⏭️ Skipping user identification');
        return;
      }
      
      if (user && user.uid !== previousUserId.current) {
        console.log('[App] 👤 Identifying user:', user.uid);
        isIdentifying.current = true;
        try {
          const result = await revenueCatService.identify(user.uid);
          if (result) {
            previousUserId.current = user.uid;
            console.log('[App] ✅ User identified successfully');
            
            // Check for expired subscription and show alert
            console.log('[App] 🔍 Checking subscription details...');
            const details = await revenueCatService.getSubscriptionDetails();
            console.log('[App] 📊 Subscription details:', details);
            
            if (details.isExpired) {
              console.log('[App] ⚠️ Subscription expired - showing alert');
              Alert.alert(
                'Subscription Expired',
                'Your TripNode Premium subscription has expired. Renew now to continue enjoying premium features.',
                [
                  { text: 'Later', style: 'cancel' },
                  { 
                    text: 'Renew Now', 
                    onPress: () => router.push('/paywall'),
                  },
                ]
              );
            }
          }
        } catch (error: any) {
          // Ignore rate limiting errors (code 7638) - not critical
          if (error?.info?.backendErrorCode !== 7638) {
            console.error('[App] ❌ Failed to identify user with RevenueCat:', error);
          } else {
            console.log('[App] ⚠️ Rate limiting error - ignoring');
          }
        } finally {
          isIdentifying.current = false;
        }
      } else if (!user && previousUserId.current && shouldEnableRevenueCat()) {
        console.log('[App] 👤 Logging out user from RevenueCat');
        isIdentifying.current = true;
        try {
          await revenueCatService.logOut();
          previousUserId.current = null;
          console.log('[App] ✅ User logged out successfully');
        } catch (error) {
          console.error('[App] ❌ Failed to log out from RevenueCat:', error);
        } finally {
          isIdentifying.current = false;
        }
      }
    };

    if (isHydrated) {
      identifyUser();
    }
  }, [user, isHydrated]);

  // Set up customer info update listener (only if RevenueCat is available)
  useEffect(() => {
    if (!user || !shouldEnableRevenueCat()) return;

    const unsubscribe = revenueCatService.addCustomerInfoUpdateListener((customerInfo) => {
      // Invalidate subscription query when customer info updates
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.status(user.uid),
      });
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isIndex = !segments[0];

    if (user && (inAuthGroup || isIndex)) {
      router.replace('/(app)/plan');
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    }
  }, [user, isHydrated, segments]);

  return { isHydrated };
}

function RootLayoutContent() {
  const { isHydrated } = useAuthRedirect();
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {!isHydrated ? (
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
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      )}
    </>
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
