# 15 — SDLC Phases

← [14_Subscription](./14_Subscription.md) | Next → [16_Verification](./16_Verification.md)

---

## Phase Overview

| Phase | Days | Focus | Deliverable |
|---|---|---|---|
| 0 — Foundation | 1–3 | Project scaffold, theme, UI atoms | Designer-accurate blank screens |
| 1 — Authentication | 4–7 | Firebase Auth, session persistence | Full auth flow working |
| 2 — Trip Generation | 8–13 | AI backend, form, Places API | End-to-end trip creation |
| 3 — Itinerary Display | 14–17 | Trip list, detail, delete, Maps | Full browse experience |
| 4 — Profile & Paywall | 18–22 | Account management, RevenueCat | Purchases working in sandbox |
| 5 — Polish | 23–26 | Animations, haptics, performance | TestFlight-ready build |
| 6 — Pre-Launch | 27–30 | Security, analytics, submission | App Store submission |

---

## Phase 0 — Foundation (Days 1–3)

**Goal:** Project runs on simulator, navigation works end-to-end, all screens render with correct Apple Glass design.

### Tasks
- `npx create-expo-app@latest TripNode --template expo-template-blank-typescript`
- Configure Expo Router group structure: `(auth)`, `(app)`, paywall modal
- Path alias `@/` → `src/` in `tsconfig.json` + `babel.config.js`
- Install all dependencies (see [02_Tech_Stack.md](./02_Tech_Stack.md))
- Build full theme system: `colors`, `typography`, `spacing`, `radii`, `animations` (see [05_Theme_System.md](./05_Theme_System.md))
- Build all UI atoms: `Button`, `Typography`, `Input`, `Card`, `GlassContainer`, `Chip`, `Badge`, `Avatar`, `Skeleton`, `Divider`
- Build shared components: `ScreenHeader`, `SafeScrollView`, `TabBarIcon`, `LoadingOverlay`
- Build `DomainError` union type + all error subtypes
- Build `ScreenErrorBoundary` and wrap root layout
- Root layout shell with provider placeholders
- Navigation guard with hardcoded `isAuthenticated = false`
- Stub all 6 screen files with correct layout structure

**Deliverable:** All 6 screens render with correct Apple Glass design, correct typography and colors. Full navigation structure navigable.

---

## Phase 1 — Authentication (Days 4–7)

**Goal:** Users can create accounts, sign in with Apple/Google/Email, and have sessions persist across app restarts.

### Tasks
- Firebase project setup: Auth (Apple, Google, Email/Password) + Firestore enabled
- `GoogleService-Info.plist` added to iOS native project
- `firebaseConfig.ts`, `firebaseAuth.ts`, `firestoreCollections.ts`
- `SecureStoreService` — typed wrapper, single import point for all token ops
- `AuthRepository` implementing `IAuthRepository`
- All 5 auth use cases: SignInWithApple, SignInWithGoogle, SignInWithEmail, Register, SignOut
- `authStore.ts` with SecureStore persistence adapter + `isHydrated` flag
- Navigation guard fully operational (reads real auth state)
- `AppleSignInButton` via `expo-apple-authentication`
- `GoogleSignInButton` via `@react-native-google-signin`
- Form validation in `useLoginViewModel` + `useRegisterViewModel`
- Axios client with: token injection interceptor, 401 refresh flow, 429 backoff, `DomainError` normalization
- `ErrorBanner` wired up in Login + Register screens

**Deliverable:** Full auth flow. Apple/Google/Email sign-in work on device. Sessions survive app restart. Logout clears state. All HTTP errors produce typed `DomainError`.

---

## Phase 2 — Trip Generation (Days 8–13)

**Goal:** End-to-end trip generation — form → AI backend → Firestore → itinerary on screen.

### Tasks
- Backend AI endpoint (separate project — Node.js or Edge Function):
  - Receives `GenerateTripRequestDto`
  - Builds AI prompt, calls OpenAI/Gemini
  - Returns structured `TripDto` with `ItineraryDay[]`
- `tripApi.ts`: `generateTrip`, `getTrips`, `getTripById`, `deleteTrip`
- `TripRepository` implementing `ITripRepository` (Firestore)
- `TripMapper` + `ActivityMapper`
- `GenerateTripUseCase`
- `tripFormStore.ts` Zustand store
- `PlanTripScreen` with all sub-components:
  - `DestinationSearchInput` → debounced 350ms → `usePlacesAutocomplete` → Google Places
  - `placesApi.getPlaceDetails()` fetches `ianaTimezone` alongside coordinates
  - `DurationDatePicker` → enforces max 5 days via `DateRange.create()`, converts to UTC on selection
  - `InterestChipGrid` → 10 interests, multi-select with haptic on each toggle
  - `BudgetInput` → numeric keyboard, formatted on blur
- Input sanitization applied in `usePlanTripViewModel` before mutation
- `usePlanTripViewModel` orchestrating form state + `useGenerateTrip` mutation
- Lottie `generating.json` animation + `LoadingOverlay` during AI call
- Error states: `NetworkError` banner with retry, AI timeout fallback message

**Deliverable:** User fills in form → AI generates itinerary → stored in Firestore → navigates to itinerary detail screen.

---

## Phase 3 — Itinerary Display (Days 14–17)

**Goal:** Browse trips, explore itineraries, delete trips, open activities in Apple Maps.

### Tasks
- `useTrips(userId)` + `useTrip(tripId)` TanStack Query hooks
- `MyTripsScreen` + `useMyTripsViewModel`
- `TripCard` with `expo-image` + background prefetch for first 3 trips
- `TripCardSkeleton` shimmer loading state
- `EmptyTripsState` with illustration
- `DeleteConfirmSheet` with `useDeleteTrip` optimistic mutation + rollback
- `ItineraryDetailScreen` + `useItineraryDetailViewModel`
- `DayTabBar` with Reanimated sliding indicator
- `TimelineSection` (Morning / Afternoon / Evening groupings)
- `ActivityCard` with all fields (name, description, duration, cost, time)
- Activity times displayed via `formatActivityTime()` in destination timezone
- `OpenInMapsButton` → `maps://maps.apple.com/?ll={lat},{lng}&q={name}` deep link

**Deliverable:** Full browse and detail experience. Trips persist across sessions. Delete with optimistic UI. Times display correctly in destination timezone.

---

## Phase 4 — Profile & Paywall (Days 18–22)

**Goal:** Account management and working in-app purchase flow.

### Tasks
- `ProfileScreen` + `useProfileViewModel`
- `ProfileHeader` — Firebase Auth `photoURL` as avatar with initials fallback
- `SettingsGroup` / `SettingsRow` components for all settings
- `ProBadge` — conditionally shown based on `useSubscriptionStatus`
- Logout: `authStore.clearUser()` + `SecureStoreService.clearToken()` + `Purchases.logOut()` + `router.replace('/(auth)/welcome')`
- **Delete account** (App Store requirement):
  - `DeleteAccountUseCase` with full Firestore cascade
  - Two-step confirmation UI in `ProfileScreen`
  - Re-auth sheet for stale Firebase token handling
- RevenueCat SDK initialized in root `_layout.tsx`
- `ISubscriptionRepository` interface + `SubscriptionRepository` implementation
- `useSubscriptionStatus` TanStack Query hook
- `PaywallScreen` + `usePaywallViewModel`
- `PlanCard` for Annual ($49.99) and Monthly ($5.99) with "BEST VALUE" badge
- Purchase success: `invalidateQueries` subscription cache, dismiss modal, haptic success
- "Restore Purchases" flow

**Deliverable:** Profile management, working RevenueCat sandbox purchases, Pro badge post-purchase, full account deletion cascade.

---

## Phase 5 — Polish & Performance (Days 23–26)

**Goal:** Native-quality feel. TestFlight-ready.

### Tasks
- Reanimated micro-interactions on all interactive elements (see [11_Performance.md](./11_Performance.md))
- Haptic feedback on all key interactions via `useHaptic`
- `React.memo` + `useCallback` audit on all list components
- `useMemo` audit on all derived data computations
- Skeleton screens verified on every async screen
- Error boundaries verified at screen level
- **Privacy manifest** (`PrivacyInfo.xcprivacy`) added via EAS plugin (see [12_Privacy_Manifest.md](./12_Privacy_Manifest.md))
- Verify all `NSPrivacyAccessedAPITypes` entries against Apple's required reasons list
- EAS config profiles: `development`, `preview` (internal TestFlight), `production`
- App Store assets: 1024×1024 icon, launch screen, screenshots (6.7" + 6.1" required)
- Run EAS build `--profile preview`, distribute to TestFlight

**Deliverable:** TestFlight build. Internal QA passes all items in [16_Verification.md](./16_Verification.md).

---

## Phase 6 — Pre-Launch (Days 27–30)

**Goal:** Production-ready. App Store submission.

### Tasks
- Deploy Firestore security rules (users access only their own data)
- RevenueCat sandbox exhaustive testing: purchase, restore, expiry, re-auth on delete
- Analytics events implemented: `trip_generated`, `paywall_viewed`, `subscription_purchased`, `auth_method_used`, `account_deleted`
- Crash reporting: Sentry or Firebase Crashlytics SDK integrated + verified
- App Store Connect setup:
  - App metadata (description, keywords, screenshots)
  - Privacy policy URL live (must describe email + user ID collection)
  - Review notes: explain account deletion location for reviewer
  - Age rating questionnaire
- Final EAS build `--profile production`
- Submit for App Store review

**Deliverable:** App submitted to App Store review.
