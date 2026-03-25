# 10 — Screen Breakdown

← [09_Timezone_Handling](./09_Timezone_Handling.md) | Next → [11_Performance](./11_Performance.md)

---

## Screen List

| Screen | Route | View-Model |
|---|---|---|
| Welcome | `/(auth)/welcome` | — (static) |
| Login | `/(auth)/login` | `useLoginViewModel` |
| Register | `/(auth)/register` | `useRegisterViewModel` |
| Plan Your Trip | `/(app)/plan` | `usePlanTripViewModel` |
| My Trips | `/(app)/trips` | `useMyTripsViewModel` |
| Itinerary Detail | `/(app)/trips/[id]` | `useItineraryDetailViewModel` |
| Profile | `/(app)/profile` | `useProfileViewModel` |
| Paywall | `/paywall` (modal) | `usePaywallViewModel` |

---

## Screen: Register / Login

```
WelcomeScreen
  SafeScrollView
    Logo + App Name ("TripNode")
    Tagline ("Your path, AI-planned.")
    AppleSignInButton          ← expo-apple-authentication (primary)
    AuthFormDivider ("or")
    GoogleSignInButton         ← @react-native-google-signin
    AuthFormDivider ("or")
    Button (variant="ghost")   ← "Sign in with Email" → LoginScreen
    Typography (caption)       ← "New here? Create an account" → RegisterScreen

LoginScreen
  SafeScrollView
    ScreenHeader ("Sign In")
    GlassContainer
      Input (label="Email", keyboardType="email-address")
      Input (label="Password", secureTextEntry)
    Button (variant="primary") ← "Sign In" → triggers useLoginViewModel.submit()
    ErrorBanner (if error)
    Typography (caption)       ← "Forgot password?" link

RegisterScreen
  SafeScrollView
    ScreenHeader ("Create Account")
    GlassContainer
      Input (label="Full Name")
      Input (label="Email", keyboardType="email-address")
      Input (label="Password", secureTextEntry)
      Input (label="Confirm Password", secureTextEntry)
    Button (variant="primary") ← "Create Account"
    ErrorBanner (if error)
```

---

## Screen: Plan Your Trip

```
PlanTripScreen
  SafeScrollView (keyboardShouldPersistTaps="handled")
    ScreenHeader (title="Plan Your Trip")

    GlassContainer
      Typography (label, "Where to?")
      DestinationSearchInput
        Input (placeholder="Search destinations...")
        [When input active:]
        FlatList (suggestions dropdown, absolute overlay)
          PlaceSuggestionRow (x N)
            Typography (place name + address)

    GlassContainer
      Typography (label, "When?")
      DurationDatePicker
        Row: [Start Date] — [End Date]
        DateTimePickerModal (native iOS picker)
        Typography (error, if > 5 days selected)

    GlassContainer
      Typography (label, "What are you into?")
      InterestChipGrid
        Chip (x 10) — Culture, Foodie, Adventure, Relax,
                      Shopping, Nightlife, History,
                      Wellness, Beach, Photography
        [Selected chips have electricBlue border + dim background]

    GlassContainer
      Typography (label, "Budget (USD)")
      BudgetInput
        Input (keyboardType="numeric", placeholder="e.g. 1500")
        Typography (hint, "Approximate total for the trip")

    GenerateTripButton
      Button (variant="primary", size="large")
      [loading state: Lottie generating.json + "Planning your trip..."]

  LoadingOverlay (full-screen, when isGenerating)
    Lottie (generating.json)
    Typography ("Finding the best experiences...")
```

---

## Screen: My Trips

```
MyTripsScreen
  ScreenHeader
    Typography (title, "My Trips")
    Button (variant="ghost", icon="+") ← navigates to Plan tab

  [State: loading]
    FlatList
      TripCardSkeleton (x 3)  ← animated shimmer placeholder

  [State: empty]
    EmptyTripsState
      Image (empty-trips.png illustration)
      Typography (title, "No paths discovered yet")
      Typography (body, "Plan your first AI-powered trip")
      Button (variant="primary") ← "Plan a Trip" → Plan tab

  [State: data]
    FlatList
      TripCard (x N)           ← React.memo wrapped
        expo-image (destination photo, cachePolicy="disk")
        GlassContainer (overlay)
          Typography (destination name, variant="headline")
          Typography (date range summary, variant="footnote")
          Row: Interest chips (truncated to 3, "+ N more")
          IconButton (delete icon)
      [onPress] → router.push(`/trips/${trip.id}`)

  DeleteConfirmSheet          ← shown when pendingDeleteId set
    BottomSheet (SlideInDown animation)
    Typography ("Delete this trip?")
    Typography (trip destination name)
    Row:
      Button (variant="ghost")    ← "Cancel"
      Button (variant="destructive") ← "Delete"
```

---

## Screen: Itinerary Detail

```
ItineraryDetailScreen
  ScreenHeader
    BackButton
    Typography (title, destination.name)
    Typography (subtitle, date range in destination timezone)

  DayTabBar                   ← horizontal scrollable tabs
    DayTab (x durationDays)   ← "Day 1", "Day 2", etc.
    Reanimated sliding indicator (electricBlue underline)

  Animated.FlatList            ← switches content on day tab change
    ItineraryDayContent (for selected day)

      TimelineSection (label="Morning", icon=☀️)
        ActivityCard (x N)
          Typography (name, variant="headline")
          Typography (description, variant="body", color="textSecondary")
          Row:
            Badge (estimatedDuration, e.g. "2 hrs")
            Badge (estimatedCost, formatted)
            Typography (time, via formatActivityTime() in destination tz)
          OpenInMapsButton
            Button (variant="ghost", icon=📍) ← maps://...

      TimelineSection (label="Afternoon", icon=🌤)
        ActivityCard (x N)

      TimelineSection (label="Evening", icon=🌙)
        ActivityCard (x N)
```

---

## Screen: Profile & Settings

```
ProfileScreen
  SafeScrollView
    ProfileHeader
      Avatar (Firebase Auth photoURL, or initials fallback)
      Typography (user.name, variant="title2")
      Typography (user.email, variant="footnote", color="textSecondary")
      ProBadge (shown if subscription.isActive)

    SettingsGroup (title="Account")
      SettingsRow ("Saved Preferences", chevron icon)
      SettingsRow ("Notifications", chevron icon)

    SettingsGroup (title="Subscription")
      SettingsRow (tier label + expiry date)
      [If free tier:]
        Button (variant="primary") ← "Upgrade to Pro" → paywall modal

    SettingsGroup (title="Information")
      SettingsRow ("Privacy Policy", external link icon)
      SettingsRow ("Terms of Service", external link icon)

    Divider

    Button (variant="ghost") ← "Log Out"
    Button (variant="destructive") ← "Delete Account"
      → DeleteConfirmSheet (two-step: confirm text + "Type DELETE")
      → Re-auth sheet if Firebase token stale
      → LoadingOverlay ("Deleting your account...")
```

---

## Screen: Paywall (Modal)

```
PaywallScreen
  SafeScrollView
    Typography (title, "Unlock TripNode Pro", variant="largeTitle")
    Typography (subtitle, "Plan unlimited trips, anywhere.")

    FeatureList
      FeatureRow (icon, "Unlimited Itineraries")
      FeatureRow (icon, "Offline Guides")
      FeatureRow (icon, "Priority Support")
      FeatureRow (icon, "Ad-Free Experience")

    PlanCard (Annual)
      Typography ("$49.99 / year")
      Badge ("BEST VALUE")
      Typography ("$4.17 / month, billed annually")
      [Selected: electricBlue border]

    PlanCard (Monthly)
      Typography ("$5.99 / month")
      Typography ("Billed monthly, cancel anytime")

    PurchaseButton
      Button (variant="primary", size="large")
      ← triggers RevenueCat purchase flow
      [loading: spinner]
      [success: dismiss modal, invalidate subscription cache]

    Row (footer links):
      Button (variant="ghost", size="small") ← "Restore Purchases"
      Button (variant="ghost", size="small") ← "Terms of Service"
      Button (variant="ghost", size="small") ← "Privacy Policy"
```
