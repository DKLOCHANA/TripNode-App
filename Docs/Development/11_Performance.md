# 11 — Performance Strategies

← [10_Screens](./10_Screens.md) | Next → [12_Privacy_Manifest](./12_Privacy_Manifest.md)

---

## Rendering Performance

### React.memo — FlatList Item Components

Every component rendered inside a `FlatList` must be wrapped in `React.memo`. Without this, a single Zustand state change re-renders the entire visible list.

```typescript
// ✅ Correct
export const TripCard = React.memo(({ trip, onDelete }: TripCardProps) => {
  return ( ... );
});

// Components requiring React.memo:
// - TripCard
// - TripCardSkeleton
// - ActivityCard
// - PlaceSuggestionRow
```

### useCallback — Event Handlers

All event handlers passed as props into list items must be stable references. Without `useCallback`, a new function reference is created on every parent render, causing all `React.memo` children to re-render.

```typescript
// In useMyTripsViewModel:
const onDeletePress = useCallback((tripId: string) => {
  setPendingDeleteId(tripId);
}, []);  // stable reference

const onDeleteConfirm = useCallback(() => {
  if (!pendingDeleteId) return;
  deleteTrip.mutate(pendingDeleteId);
  setPendingDeleteId(null);
}, [pendingDeleteId, deleteTrip]);
```

### useMemo — Derived Data

Grouping activities into time slots is a pure transform. Compute it once and memoize.

```typescript
// In useItineraryDetailViewModel:
const groupedActivities = useMemo(() => ({
  morning:   activities.filter(a => a.timeSlot === 'morning'),
  afternoon: activities.filter(a => a.timeSlot === 'afternoon'),
  evening:   activities.filter(a => a.timeSlot === 'evening'),
}), [activities]);  // only recomputes when activities array reference changes
```

---

## FlatList Configuration

Apply to all FlatLists in the app:

```typescript
<FlatList
  data={trips}
  renderItem={({ item }) => <TripCard trip={item} onDelete={onDeletePress} />}
  keyExtractor={item => item.id}      // stable string IDs — never array indices
  initialNumToRender={5}             // render only what's visible + 1 page
  maxToRenderPerBatch={3}            // reduce jank during fast scrolls
  windowSize={5}                     // reduce off-screen component count
  removeClippedSubviews={true}       // unmount items scrolled far off-screen
  showsVerticalScrollIndicator={false}
/>
```

For **fixed-height** lists (e.g. trip cards with a consistent height), also add:
```typescript
getItemLayout={(_, index) => ({
  length: TRIP_CARD_HEIGHT,
  offset: TRIP_CARD_HEIGHT * index,
  index,
})}
```

---

## Image Caching

Use `expo-image` — not React Native's built-in `Image` or `react-native-fast-image`.

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: destinationPhotoUrl }}
  style={styles.photo}
  contentFit="cover"
  cachePolicy="disk"           // persist to disk across app launches
  transition={200}             // smooth fade-in on load
  placeholder={blurhash}       // low-resolution placeholder while loading
/>
```

### Prefetch Strategy

When `MyTripsScreen` mounts, background-prefetch the destination photos for the first 3 trips. This ensures images are in cache before the user taps into them.

```typescript
// In useMyTripsViewModel, after trips data loads:
useEffect(() => {
  if (!trips) return;
  trips.slice(0, 3).forEach(trip => {
    if (trip.destinationPhotoUrl) {
      Image.prefetch(trip.destinationPhotoUrl);
    }
  });
}, [trips]);
```

---

## Animation Performance

**Rule: All animations run on the UI thread via Reanimated worklets. Never use `Animated` from React Native core.**

`Animated` runs on the JS thread — it will jank during heavy renders (trip generation, large lists). Reanimated worklets run on the UI thread regardless of JS thread load, guaranteeing 60/120fps.

### Key Animated Interactions

| Element | Animation | API |
|---|---|---|
| `DayTabBar` active indicator | Slides horizontally | `useSharedValue` + `withSpring(springs.snappy)` |
| `TripCard` press | Scale 1.0 → 0.97 on press | `useAnimatedStyle` + `withSpring` |
| `ActivityCard` press | Scale 1.0 → 0.97 on press | `useAnimatedStyle` + `withSpring` |
| List item entrance | `FadeInDown` with stagger | `entering` prop on `Animated.View` |
| `LoadingOverlay` | Fade in/out | `FadeIn` / `FadeOut` layout animations |
| `DeleteConfirmSheet` | Slide up from bottom | `SlideInDown` / `SlideOutDown` |
| Tab bar icons | Bounce on active | `BounceIn` entering animation |

### Press Feedback Pattern

```typescript
// Reusable press feedback (applies to TripCard, ActivityCard, etc.)
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const handlers = useAnimatedGestureHandler({
  onActive: () => { scale.value = withSpring(0.97, springs.snappy); },
  onEnd:    () => { scale.value = withSpring(1.0,  springs.snappy); },
  onFail:   () => { scale.value = withSpring(1.0,  springs.snappy); },
});
```

---

## Network Performance

| Strategy | Implementation |
|---|---|
| Places debounce | 350ms via `useDebounce` hook, `enabled: query.length > 2` |
| Optimistic delete | Remove from TanStack cache immediately, rollback on error |
| Paywall lazy loading | `React.lazy + Suspense` — not loaded until first `/paywall` push |
| Firebase imports | Module-level: `firebase/auth`, `firebase/firestore` only — never `import * from 'firebase'` |
| Query deduplication | TanStack Query automatically deduplicates identical in-flight requests |

### Lazy Paywall

```typescript
// app/paywall.tsx
import { Suspense, lazy } from 'react';
const PaywallScreen = lazy(() =>
  import('@/presentation/screens/paywall/PaywallScreen')
);

export default function PaywallRoute() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <PaywallScreen />
    </Suspense>
  );
}
```

---

## Haptic Feedback

Haptics make the app feel native-quality. Use `useHaptic` hook (wraps `expo-haptics`) — never call `expo-haptics` directly from components.

```typescript
// src/hooks/useHaptic.ts
import * as Haptics from 'expo-haptics';

export const useHaptic = () => ({
  impact:       () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  lightImpact:  () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  success:      () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error:        () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection:    () => Haptics.selectionAsync(),
});

// Usage in view-models or components:
const haptic = useHaptic();
// On CTA press:
haptic.impact();
// On trip generation success:
haptic.success();
// On delete confirm:
haptic.error();
// On interest chip select:
haptic.selection();
```
