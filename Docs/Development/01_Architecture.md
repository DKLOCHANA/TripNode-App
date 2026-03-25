# 01 — Architecture & Folder Structure

← [INDEX](./INDEX.md) | Next → [02_Tech_Stack](./02_Tech_Stack.md)

---

## Clean Architecture

TripNode follows Clean Architecture with three strict layers. Dependencies only point **inward** — the Domain layer has zero knowledge of React, Firebase, or any external library.

```
┌─────────────────────────────────────┐
│         Presentation Layer          │  ← React Native, Expo Router, Zustand
│  (Screens, View-Models, Components) │
├─────────────────────────────────────┤
│            Data Layer               │  ← Firebase, Axios, SecureStore
│  (Repositories, Sources, Mappers)   │
├─────────────────────────────────────┤
│           Domain Layer              │  ← Pure TypeScript, zero deps
│  (Entities, Use Cases, Interfaces)  │
└─────────────────────────────────────┘
```

### Layer Rules

| Layer | Can import from | Cannot import from |
|---|---|---|
| Domain | Nothing | Data, Presentation, React, Firebase |
| Data | Domain | Presentation, React |
| Presentation | Domain, Data | — |

---

## SDLC Principles

- Feature branches per phase — PR reviews before merge
- TypeScript strict mode — no `any` allowed
- ESLint + Prettier enforced via pre-commit hooks (Husky)
- Environment variables for all API keys — never hardcoded
- Firestore security rules: users read/write only their own documents
- `PrivacyInfo.xcprivacy` required before App Store submission
- In-app account deletion mandatory (App Store requirement)

---

## Full Folder Structure

```
TripNode/
├── app.json
├── babel.config.js
├── tsconfig.json
├── eas.json
├── .env                            # EXPO_PUBLIC_* vars (committed, no secrets)
├── .env.local                      # Developer overrides (gitignored)
├── .eslintrc.js
├── .prettierrc
│
├── app/                            # Expo Router — route files only, thin shells
│   ├── _layout.tsx                 # Root: QueryClientProvider, Zustand hydration,
│   │                               #        RevenueCat init, fonts, splash control
│   ├── +not-found.tsx
│   │
│   ├── (auth)/                     # Unauthenticated stack (no tab bar)
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   │
│   ├── (app)/                      # Authenticated tabs
│   │   ├── _layout.tsx             # ← Navigation Guard lives here
│   │   ├── plan/
│   │   │   └── index.tsx
│   │   ├── trips/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx            # Dynamic itinerary detail route
│   │   └── profile/
│   │       └── index.tsx
│   │
│   └── paywall.tsx                 # Full-screen modal, pushed from any tab
│
├── src/
│   │
│   ├── domain/                     # ══ DOMAIN LAYER — zero external deps ══
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── Trip.ts
│   │   │   ├── Itinerary.ts
│   │   │   ├── Activity.ts
│   │   │   └── Subscription.ts
│   │   ├── value-objects/
│   │   │   ├── DateRange.ts        # Immutable, enforces max 5 days, timezone-aware
│   │   │   ├── Budget.ts
│   │   │   ├── Location.ts         # Includes ianaTimezone field
│   │   │   └── Interest.ts         # Union type of 10 interest categories
│   │   ├── repositories/           # Interfaces only — no implementations
│   │   │   ├── IAuthRepository.ts
│   │   │   ├── ITripRepository.ts
│   │   │   ├── IUserRepository.ts
│   │   │   └── ISubscriptionRepository.ts
│   │   └── use-cases/
│   │       ├── auth/
│   │       │   ├── SignInWithAppleUseCase.ts
│   │       │   ├── SignInWithGoogleUseCase.ts
│   │       │   ├── SignInWithEmailUseCase.ts
│   │       │   ├── RegisterWithEmailUseCase.ts
│   │       │   └── SignOutUseCase.ts
│   │       ├── trip/
│   │       │   ├── GenerateTripUseCase.ts
│   │       │   ├── GetTripsUseCase.ts
│   │       │   ├── GetTripByIdUseCase.ts
│   │       │   └── DeleteTripUseCase.ts
│   │       ├── subscription/
│   │       │   ├── GetSubscriptionStatusUseCase.ts
│   │       │   └── PurchaseSubscriptionUseCase.ts
│   │       └── account/
│   │           └── DeleteAccountUseCase.ts  # Auth + Firestore cascade + RevenueCat
│   │
│   ├── data/                       # ══ DATA LAYER — implements domain contracts ══
│   │   ├── repositories/
│   │   │   ├── AuthRepository.ts
│   │   │   ├── TripRepository.ts
│   │   │   ├── UserRepository.ts
│   │   │   └── SubscriptionRepository.ts
│   │   ├── sources/
│   │   │   ├── remote/
│   │   │   │   ├── api/
│   │   │   │   │   ├── client.ts   # Axios instance + interceptors
│   │   │   │   │   ├── authApi.ts
│   │   │   │   │   ├── tripApi.ts
│   │   │   │   │   └── userApi.ts
│   │   │   │   ├── firebase/
│   │   │   │   │   ├── firebaseConfig.ts
│   │   │   │   │   ├── firebaseAuth.ts
│   │   │   │   │   └── firestoreCollections.ts
│   │   │   │   └── google/
│   │   │   │       └── placesApi.ts
│   │   │   └── local/
│   │   │       ├── secureStore.ts  # Typed wrapper: getToken / setToken / clearToken
│   │   │       └── asyncStorage.ts
│   │   ├── mappers/                # Pure functions: DTO ↔ Entity
│   │   │   ├── UserMapper.ts
│   │   │   ├── TripMapper.ts
│   │   │   └── ActivityMapper.ts
│   │   └── dto/                    # API response shapes (not domain types)
│   │       ├── UserDto.ts
│   │       ├── TripDto.ts
│   │       └── ActivityDto.ts
│   │
│   ├── presentation/               # ══ PRESENTATION LAYER — React Native ══
│   │   ├── screens/                # Thin components — delegate all logic to view-models
│   │   │   ├── auth/
│   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── RegisterScreen.tsx
│   │   │   ├── plan/
│   │   │   │   └── PlanTripScreen.tsx
│   │   │   ├── trips/
│   │   │   │   ├── MyTripsScreen.tsx
│   │   │   │   └── ItineraryDetailScreen.tsx
│   │   │   ├── profile/
│   │   │   │   └── ProfileScreen.tsx
│   │   │   └── paywall/
│   │   │       └── PaywallScreen.tsx
│   │   │
│   │   ├── view-models/            # One hook per screen — all screen logic here
│   │   │   ├── useLoginViewModel.ts
│   │   │   ├── useRegisterViewModel.ts
│   │   │   ├── usePlanTripViewModel.ts
│   │   │   ├── useMyTripsViewModel.ts
│   │   │   ├── useItineraryDetailViewModel.ts
│   │   │   ├── useProfileViewModel.ts
│   │   │   └── usePaywallViewModel.ts
│   │   │
│   │   └── components/
│   │       ├── ui/                 # Design system atoms — fully reusable
│   │       │   ├── Button/
│   │       │   │   ├── Button.tsx
│   │       │   │   ├── Button.types.ts
│   │       │   │   └── index.ts
│   │       │   ├── Card/
│   │       │   │   ├── Card.tsx
│   │       │   │   ├── Card.types.ts
│   │       │   │   └── index.ts
│   │       │   ├── Input/
│   │       │   │   ├── Input.tsx
│   │       │   │   ├── Input.types.ts
│   │       │   │   └── index.ts
│   │       │   ├── Typography/
│   │       │   │   ├── Typography.tsx
│   │       │   │   ├── Typography.types.ts
│   │       │   │   └── index.ts
│   │       │   ├── GlassContainer/
│   │       │   │   ├── GlassContainer.tsx
│   │       │   │   └── index.ts
│   │       │   ├── Badge/
│   │       │   │   └── Badge.tsx
│   │       │   ├── Chip/
│   │       │   │   └── Chip.tsx
│   │       │   ├── Skeleton/
│   │       │   │   └── Skeleton.tsx
│   │       │   ├── Divider/
│   │       │   │   └── Divider.tsx
│   │       │   └── Avatar/
│   │       │       └── Avatar.tsx
│   │       ├── auth/
│   │       │   ├── AppleSignInButton.tsx
│   │       │   ├── GoogleSignInButton.tsx
│   │       │   └── AuthFormDivider.tsx
│   │       ├── plan/
│   │       │   ├── DestinationSearchInput.tsx
│   │       │   ├── DurationDatePicker.tsx
│   │       │   ├── InterestChipGrid.tsx
│   │       │   ├── BudgetInput.tsx
│   │       │   └── GenerateTripButton.tsx
│   │       ├── trips/
│   │       │   ├── TripCard.tsx
│   │       │   ├── TripCardSkeleton.tsx
│   │       │   ├── EmptyTripsState.tsx
│   │       │   └── DeleteConfirmSheet.tsx
│   │       ├── itinerary/
│   │       │   ├── DayTabBar.tsx
│   │       │   ├── TimelineSection.tsx
│   │       │   ├── ActivityCard.tsx
│   │       │   └── OpenInMapsButton.tsx
│   │       ├── profile/
│   │       │   ├── ProfileHeader.tsx
│   │       │   ├── SettingsGroup.tsx
│   │       │   ├── SettingsRow.tsx
│   │       │   └── ProBadge.tsx
│   │       ├── paywall/
│   │       │   ├── PlanCard.tsx
│   │       │   ├── FeatureList.tsx
│   │       │   └── PurchaseButton.tsx
│   │       └── shared/
│   │           ├── ScreenHeader.tsx
│   │           ├── LoadingOverlay.tsx
│   │           ├── ErrorBanner.tsx
│   │           ├── TabBarIcon.tsx
│   │           └── SafeScrollView.tsx
│   │
│   ├── store/                      # Zustand — client/UI state only
│   │   ├── authStore.ts
│   │   ├── tripFormStore.ts
│   │   └── uiStore.ts
│   │
│   ├── hooks/                      # Shared, reusable hooks
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useHaptic.ts
│   │   ├── useColorScheme.ts
│   │   └── useRevenueCat.ts
│   │
│   ├── services/                   # External SDK wrappers
│   │   ├── revenueCatService.ts
│   │   ├── analyticsService.ts
│   │   └── hapticService.ts
│   │
│   ├── lib/                        # Pure utilities — no React deps
│   │   ├── queryClient.ts
│   │   ├── queryKeys.ts
│   │   ├── date.ts                 # date-fns-tz helpers
│   │   ├── currency.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   │
│   ├── errors/                     # Error handling — domain error types
│   │   ├── DomainError.ts
│   │   ├── NetworkError.ts
│   │   ├── AuthError.ts
│   │   ├── ValidationError.ts
│   │   ├── NotFoundError.ts
│   │   └── errorBoundary.tsx
│   │
│   ├── theme/                      # Design system — single source of truth
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── radii.ts
│   │   ├── shadows.ts
│   │   ├── animations.ts
│   │   └── index.ts
│   │
│   └── types/
│       ├── navigation.ts
│       ├── api.ts
│       ├── env.d.ts
│       └── global.d.ts
│
└── assets/
    ├── images/
    │   ├── logo.png
    │   ├── welcome-bg.jpg
    │   └── empty-trips.png
    └── animations/
        └── generating.json         # Lottie: AI generation loading
```
