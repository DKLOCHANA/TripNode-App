# 04 — Navigation Architecture

← [03_State_Management](./03_State_Management.md) | Next → [05_Theme_System](./05_Theme_System.md)

---

## Route Structure (Expo Router)

```
/                           Root layout — providers, fonts, RevenueCat init
  /(auth)                   Stack — unauthenticated (no tab bar)
    /welcome                Landing / hero screen
    /login                  Login
    /register               Register
  /(app)                    Tabs — authenticated (navigation guard here)
    /plan                   Tab 1 — Plan Your Trip
    /trips                  Tab 2 — My Trips
      /[id]                 Pushed onto trips stack — Itinerary Detail
    /profile                Tab 3 — Profile & Settings
  /paywall                  Full-screen modal (pushed from any tab)
```

---

## Root Layout (`app/_layout.tsx`)

The composition root of the entire app. Everything that needs to be initialized once lives here.

```typescript
// Responsibilities:
// 1. Load fonts (if any custom beyond SF Pro system font)
// 2. Keep splash screen visible until fonts + Zustand hydration complete
// 3. Initialize RevenueCat SDK
// 4. Wrap tree in QueryClientProvider
// 5. Wrap tree in GestureHandlerRootView (required for Gesture Handler)
// 6. Wrap tree in SafeAreaProvider

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ ... });
  const { isHydrated } = useAuthStore();

  useEffect(() => {
    revenueCatService.configure(process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY!);
  }, []);

  useEffect(() => {
    if (fontsLoaded && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isHydrated]);

  if (!fontsLoaded || !isHydrated) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ScreenErrorBoundary>
            <Stack />
          </ScreenErrorBoundary>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
```

---

## Navigation Guard (`app/(app)/_layout.tsx`)

Protects all authenticated routes. Reads from `authStore` and redirects if not authenticated.

```typescript
export default function AppLayout() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, isHydrated]);

  // While hydrating — render nothing (splash screen is still visible at root)
  if (!isHydrated) return null;

  // Not authenticated — redirect is in flight, render nothing
  if (!isAuthenticated) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.tabBarBorder,
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        headerShown: false,
      }}
    >
      <Tabs.Screen name="plan" options={{ title: 'Plan', tabBarIcon: ... }} />
      <Tabs.Screen name="trips" options={{ title: 'My Trips', tabBarIcon: ... }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ... }} />
    </Tabs>
  );
}
```

---

## Auth Stack (`app/(auth)/_layout.tsx`)

Simple stack with no tab bar. Slides left-to-right between welcome → login → register.

```typescript
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.backgroundPrimary },
        animation: 'slide_from_right',
      }}
    />
  );
}
```

---

## Paywall Modal Route (`app/paywall.tsx`)

Pushed from any screen using `router.push('/paywall')`. Dismissible with swipe-down gesture.

```typescript
// How to trigger from any screen:
import { router } from 'expo-router';
router.push('/paywall');

// In app/(app)/_layout.tsx, register as a modal:
<Stack.Screen
  name="paywall"
  options={{
    presentation: 'modal',
    animation: 'slide_from_bottom',
    headerShown: false,
  }}
/>
```

---

## Navigation Patterns

### After Successful Login
```typescript
router.replace('/(app)/plan');  // replace — no back button to auth
```

### After Logout / Account Deletion
```typescript
// Clear state first, then navigate
authStore.clearUser();
await SecureStoreService.clearToken();
router.replace('/(auth)/welcome');  // replace — removes app stack from history
```

### Deep Linking to Itinerary
```typescript
// From TripCard onPress:
router.push(`/trips/${trip.id}`);
```

### Feature-Gated Action → Paywall
```typescript
// In any view-model:
const { isActive } = useSubscriptionStatus();
if (!isActive) {
  router.push('/paywall');
  return;
}
// Proceed with Pro feature
```
