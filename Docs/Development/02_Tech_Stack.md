# 02 — Tech Stack

← [01_Architecture](./01_Architecture.md) | Next → [03_State_Management](./03_State_Management.md)

---

## All Dependencies

| Category | Library | Version | Purpose |
|---|---|---|---|
| Framework | Expo SDK | ~53.0.0 | Core Expo platform |
| Runtime | React Native | 0.76.x | iOS native runtime |
| Language | TypeScript | ^5.3.0 | Type safety, strict mode |
| Routing | Expo Router | ~4.0.0 | File-based navigation |
| Server State | TanStack Query | ^5.56.0 | API data fetching + caching |
| Client State | Zustand | ^5.0.0 | Auth session + UI state |
| HTTP Client | Axios | ^1.7.0 | API requests + interceptors |
| Animations | React Native Reanimated | ~3.16.0 | UI-thread animations |
| Gestures | React Native Gesture Handler | ~2.20.0 | Touch interactions |
| Glass FX | expo-blur | ~14.0.0 | BlurView for Apple Glass |
| Token Storage | expo-secure-store | ~14.0.0 | JWT secure persistence |
| Images | expo-image | ~2.0.0 | Cached images (SDWebImage) |
| Auth — Apple | expo-apple-authentication | ~7.0.0 | Apple Sign In |
| Auth — Google | @react-native-google-signin/google-signin | ^13.0.0 | Google Sign In |
| Backend | Firebase (Auth + Firestore) | ^11.0.0 | Auth + database |
| Places | Google Places API (New) | — | Destination autocomplete |
| Maps | react-native-maps | 1.18.0 | Map display |
| Purchases | purchases-react-native (RevenueCat) | ^8.0.0 | In-app subscriptions |
| Loading FX | lottie-react-native | ^7.1.0 | AI generation animation |
| Date Utils | date-fns | ^3.6.0 | Date manipulation |
| Timezone | date-fns-tz | ^3.1.0 | Timezone-aware formatting |
| Date Picker | @react-native-community/datetimepicker | 8.2.0 | Native date picker |
| Haptics | expo-haptics | ~14.0.0 | Tactile feedback |
| Safe Area | react-native-safe-area-context | 4.12.0 | Notch/island handling |
| Screens | react-native-screens | ~4.1.0 | Native screen containers |
| Fonts | expo-font | ~13.0.0 | Font loading (if custom) |
| Splash | expo-splash-screen | ~0.29.0 | Splash screen control |
| Status Bar | expo-status-bar | ~2.0.0 | iOS status bar styling |
| Linking | expo-linking | ~7.0.0 | Deep links (Maps) |
| Constants | expo-constants | ~17.0.0 | App config access |

---

## package.json Reference

```json
{
  "dependencies": {
    "expo": "~53.0.0",
    "expo-router": "~4.0.0",
    "react": "18.3.2",
    "react-native": "0.76.x",
    "typescript": "^5.3.0",

    "@tanstack/react-query": "^5.56.0",
    "zustand": "^5.0.0",
    "axios": "^1.7.0",

    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.1.0",

    "expo-blur": "~14.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-apple-authentication": "~7.0.0",
    "expo-haptics": "~14.0.0",
    "expo-image": "~2.0.0",
    "expo-font": "~13.0.0",
    "expo-splash-screen": "~0.29.0",
    "expo-status-bar": "~2.0.0",
    "expo-linking": "~7.0.0",
    "expo-constants": "~17.0.0",

    "firebase": "^11.0.0",
    "@react-native-google-signin/google-signin": "^13.0.0",

    "react-native-maps": "1.18.0",

    "purchases-react-native": "^8.0.0",

    "lottie-react-native": "^7.1.0",
    "@react-native-community/datetimepicker": "8.2.0",

    "date-fns": "^3.6.0",
    "date-fns-tz": "^3.1.0"
  }
}
```

---

## Key Decisions

**Why Expo Router (not React Navigation)?**
File-based routing matches the mental model of the screen structure. Group routes `(auth)` and `(app)` cleanly separate authenticated and unauthenticated stacks. Modal routes like `paywall.tsx` work naturally.

**Why TanStack Query + Zustand (not Redux)?**
TanStack Query eliminates boilerplate for server state (loading, error, caching, refetch). Zustand handles the small amount of client state (session, form draft, loading overlay) with minimal setup. Redux would be over-engineered for this scope.

**Why Firebase (not Supabase)?**
Apple Sign In + Firebase Auth is a well-documented, production-proven combination for iOS apps. Firestore's real-time capability is available if needed post-MVP. Supabase is a valid alternative but adds PostgreSQL complexity the MVP doesn't need.

**Why RevenueCat (not StoreKit directly)?**
RevenueCat abstracts StoreKit 2 complexity, provides a dashboard for subscription analytics, and handles edge cases (refunds, expiry, restore) that raw StoreKit requires manual handling for.

**Why expo-image (not react-native-fast-image)?**
`expo-image` is the official Expo solution built on SDWebImage for iOS. `react-native-fast-image` is deprecated and unmaintained. `expo-image` provides disk caching, progressive loading, and prefetch out of the box.

**Why Reanimated (not Animated)?**
`Animated` from React Native core runs on the JS thread — it will jank during heavy renders. Reanimated runs on the UI thread via worklets, delivering 60/120fps animations regardless of JS thread load.
