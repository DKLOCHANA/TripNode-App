# 16 — Verification Checklist

← [15_SDLC_Phases](./15_SDLC_Phases.md) | [Back to INDEX](./INDEX.md)

---

## How to Use This Checklist

Complete all items before submitting to TestFlight (Phase 5) and before App Store submission (Phase 6). Items marked **[App Store]** will cause rejection if missing.

---

## Phase 0 — Foundation

- [ ] `npx expo start --ios` opens on simulator without errors
- [ ] All 6 screens render with Apple Glass design (correct colors, blur, typography)
- [ ] Navigation between all routes works (auth stack, app tabs, paywall modal)
- [ ] Tab bar renders with correct active/inactive colors
- [ ] `GlassContainer` renders `BlurView` correctly — not a flat color
- [ ] `Typography` component renders all variants at correct iOS HIG sizes
- [ ] `Button` primary/secondary/ghost/destructive variants render correctly
- [ ] `Chip` selected state shows Electric Blue border and dim background

---

## Phase 1 — Authentication

- [ ] Register with email/password → navigates to Plan tab
- [ ] Login with email/password → navigates to Plan tab
- [ ] Apple Sign In works on physical device (not available on simulator)
- [ ] Google Sign In works on physical device
- [ ] Session persists: kill app → relaunch → lands on Plan tab (not Welcome screen)
- [ ] Logout: clears session, navigates to Welcome screen, cannot go back
- [ ] Wrong password: `ErrorBanner` appears with correct message
- [ ] Network offline: `ErrorBanner` with "retry" button appears (not crash)
- [ ] 401 after token expiry: app signs out automatically, no error shown to user

---

## Phase 2 — Trip Generation

- [ ] Destination search input shows autocomplete results from Google Places
- [ ] Selecting a destination populates the form with place name
- [ ] `ianaTimezone` is populated on destination selection (verify in store debugger)
- [ ] Date picker allows selecting dates
- [ ] Date picker prevents selecting more than 5 days (error message shown)
- [ ] At least 1 interest chip can be selected (haptic fires on selection)
- [ ] Budget input accepts numbers only
- [ ] Input sanitization: pasting `<script>` into destination name strips `<>` characters
- [ ] "Generate My Trip" button is disabled when form is incomplete
- [ ] Lottie animation plays during AI generation
- [ ] Generated itinerary navigates to Itinerary Detail screen
- [ ] Generated trip appears in My Trips list
- [ ] AI endpoint timeout: retries once, shows error banner on second failure
- [ ] Network offline during generation: error banner with retry

---

## Phase 3 — Itinerary Display

- [ ] My Trips screen shows skeleton cards during initial load
- [ ] Trip cards show destination photo (from expo-image, disk-cached)
- [ ] Trip cards show destination name, date range, interest chips
- [ ] Empty state illustration shows when user has no trips
- [ ] "Plan a Trip" CTA in empty state navigates to Plan tab
- [ ] Tapping a trip card navigates to Itinerary Detail
- [ ] Itinerary Detail shows correct destination name and date range
- [ ] Day tabs switch between days (Day 1, Day 2, etc.)
- [ ] Reanimated indicator slides smoothly between day tabs (no JS thread jank)
- [ ] Activities grouped correctly into Morning / Afternoon / Evening
- [ ] Activity times display in **destination timezone** (not device timezone)
  - Test: plan Tokyo trip from a non-Tokyo timezone device, verify times are JST
- [ ] "Open in Maps" opens Apple Maps with correct location pin
- [ ] Delete trip: card disappears immediately (optimistic update)
- [ ] Delete trip: cancel in confirmation sheet → card reappears (rollback)
- [ ] Delete confirmation requires tapping "Delete" button (not accidental swipe)

---

## Phase 4 — Profile & Paywall

- [ ] Profile screen shows avatar (or initials if no photo), name, email
- [ ] Pro badge **not** shown for free tier users
- [ ] Pro badge **shown** after successful purchase
- [ ] "Upgrade to Pro" button visible for free tier, navigates to paywall
- [ ] Paywall shows Annual ($49.99) and Monthly ($5.99) plans
- [ ] Annual plan has "BEST VALUE" badge
- [ ] Selecting Annual plan highlights it with Electric Blue border
- [ ] RevenueCat sandbox purchase: Annual plan completes successfully
- [ ] RevenueCat sandbox purchase: Monthly plan completes successfully
- [ ] After purchase: paywall dismisses, Pro badge appears on Profile
- [ ] "Restore Purchases" restores a previously purchased subscription
- [ ] Logout: navigates to Welcome screen, cannot navigate back to app tabs
- [ ] **[App Store]** Delete Account: confirmation sheet appears
- [ ] **[App Store]** Delete Account: all Firestore data deleted (verify in Firebase console)
- [ ] **[App Store]** Delete Account: Firebase Auth user deleted (verify in Firebase Auth console)
- [ ] **[App Store]** Delete Account: SecureStore tokens cleared (verify by restarting app — shows Welcome)
- [ ] **[App Store]** Delete Account: re-auth sheet appears when Firebase token is stale
- [ ] **[App Store]** Delete Account: re-auth allows deletion to proceed after re-authentication

---

## Phase 5 — Polish

- [ ] Button presses have haptic impact feedback
- [ ] Trip generation success has haptic success notification
- [ ] Delete confirmation has haptic error notification
- [ ] Interest chip selection has haptic selection feedback
- [ ] TripCard press animation: scales down to 0.97 on press, springs back on release
- [ ] ActivityCard press animation: same scale feedback
- [ ] DayTabBar indicator slides with spring animation between tabs
- [ ] Trip list items animate in with FadeInDown stagger on first load
- [ ] DeleteConfirmSheet slides up from bottom, slides down on dismiss
- [ ] No JS thread animation jank (verify with React Native Debugger Perf Monitor)
- [ ] All FlatLists scroll at 60fps with no dropped frames
- [ ] Skeleton screens show on every async screen before data loads
- [ ] Error boundaries: force a render error, verify app shows error screen not crash
- [ ] **[App Store]** `PrivacyInfo.xcprivacy` is present in Xcode project navigator
- [ ] **[App Store]** All 4 `NSPrivacyAccessedAPITypes` entries are in the file
- [ ] EAS preview build: `eas build --platform ios --profile preview` succeeds
- [ ] Preview build uploads to TestFlight without errors

---

## Phase 6 — Pre-Launch

- [ ] Firestore security rules deployed: user can only read/write own documents
- [ ] Verify security rules: attempt to read another user's trip via REST API → rejected
- [ ] `trip_generated` analytics event fires after successful generation
- [ ] `paywall_viewed` analytics event fires when paywall opens
- [ ] `subscription_purchased` analytics event fires after purchase
- [ ] `account_deleted` analytics event fires after deletion
- [ ] Crash reporting SDK initialized: trigger a test crash, verify it appears in dashboard
- [ ] **[App Store]** Privacy policy URL is live and accessible
- [ ] **[App Store]** Privacy policy describes email address + user ID collection
- [ ] **[App Store]** App Store Connect screenshots uploaded (6.7" iPhone required)
- [ ] **[App Store]** Age rating questionnaire complete
- [ ] **[App Store]** Review notes include account deletion steps for reviewer
- [ ] Production EAS build: `eas build --platform ios --profile production` succeeds
- [ ] App submitted for App Store review
