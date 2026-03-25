# TripNode MVP — Documentation Index

> **App:** TripNode — "Your path, AI-planned."
> **Platform:** iOS only (Expo Go, MVP)
> **Design Language:** Apple Glass — frosted glass, SF Pro, Electric Blue (#0A84FF), OLED-black

---

## Documents

| # | File | Contents |
|---|---|---|
| 1 | [01_Architecture.md](./01_Architecture.md) | Clean Architecture layers, SDLC principles, full folder structure |
| 2 | [02_Tech_Stack.md](./02_Tech_Stack.md) | All dependencies with versions and purpose |
| 3 | [03_State_Management.md](./03_State_Management.md) | Zustand stores, TanStack Query, query keys, custom hooks |
| 4 | [04_Navigation.md](./04_Navigation.md) | Expo Router structure, navigation guard pattern |
| 5 | [05_Theme_System.md](./05_Theme_System.md) | Colors, typography, spacing, radii, animations, GlassContainer |
| 6 | [06_Error_Handling.md](./06_Error_Handling.md) | DomainError union, Axios interceptors, rate-limit backoff, error boundary |
| 7 | [07_Security.md](./07_Security.md) | Input sanitization, token storage rules, environment variable strategy |
| 8 | [08_API_Service_Layer.md](./08_API_Service_Layer.md) | Axios client, service modules, Google Places session tokens |
| 9 | [09_Timezone_Handling.md](./09_Timezone_Handling.md) | UTC storage strategy, Location + DateRange value objects, display helpers |
| 10 | [10_Screens.md](./10_Screens.md) | Component tree for all 6 screens |
| 11 | [11_Performance.md](./11_Performance.md) | Rendering, FlatList config, image caching, Reanimated, network |
| 12 | [12_Privacy_Manifest.md](./12_Privacy_Manifest.md) | iOS PrivacyInfo.xcprivacy — required entries + EAS integration |
| 13 | [13_Account_Deletion.md](./13_Account_Deletion.md) | Full cascade deletion, DeleteAccountUseCase, re-auth, Firestore batch |
| 14 | [14_Subscription.md](./14_Subscription.md) | ISubscriptionRepository, SubscriptionRepository, RevenueCat constants |
| 15 | [15_SDLC_Phases.md](./15_SDLC_Phases.md) | 6 development phases, day-by-day deliverables |
| 16 | [16_Verification.md](./16_Verification.md) | End-to-end QA checklist before TestFlight submission |

---

## Critical Build Order

Start here — these files must be implemented first as everything else depends on them:

1. `src/theme/index.ts` — every component imports from here
2. `app/_layout.tsx` — providers, RevenueCat init, splash control
3. `src/errors/DomainError.ts` — error contract for interceptors and view-models
4. `src/store/authStore.ts` — drives navigation guard + API authorization
5. `src/data/sources/remote/api/client.ts` — Axios interceptors, all API calls depend on this
6. `src/lib/queryClient.ts` — TanStack stale/retry config
7. `src/lib/queryKeys.ts` — typed key factory for cache invalidation
8. `src/domain/repositories/ISubscriptionRepository.ts` — must exist before RevenueCat work
9. `src/lib/date.ts` — timezone helpers required by itinerary display and form

---

## Quick Reference

- **Apple Glass component:** `GlassContainer` → [05_Theme_System.md](./05_Theme_System.md)
- **Auth flow:** [04_Navigation.md](./04_Navigation.md) + Phase 1 in [15_SDLC_Phases.md](./15_SDLC_Phases.md)
- **AI trip generation:** Phase 2 in [15_SDLC_Phases.md](./15_SDLC_Phases.md)
- **App Store requirements:** [12_Privacy_Manifest.md](./12_Privacy_Manifest.md) + [13_Account_Deletion.md](./13_Account_Deletion.md)
- **Paywall / RevenueCat:** [14_Subscription.md](./14_Subscription.md)
- **Testing before ship:** [16_Verification.md](./16_Verification.md)
