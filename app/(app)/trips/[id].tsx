import { ItineraryDetailScreen } from '@/presentation/screens/trips/ItineraryDetailScreen';

// The bottom tab bar stays visible across the whole app. We intentionally do
// NOT hide it here: hiding it via `getParent().setOptions({ tabBarStyle })` and
// restoring it on unmount stamped a hardcoded (and, after a theme switch on a
// frozen screen, stale) tabBarStyle onto the Tabs navigator, which stuck until
// app restart and showed the wrong background colour. Styling now lives solely
// in the themed tab bar in app/(app)/_layout.tsx.
export default function ItineraryDetailRoute() {
  return <ItineraryDetailScreen />;
}
