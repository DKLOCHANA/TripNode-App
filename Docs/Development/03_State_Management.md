# 03 — State Management

← [02_Tech_Stack](./02_Tech_Stack.md) | Next → [04_Navigation](./04_Navigation.md)

---

## Two-Store Principle

| State Type | Tool | What it holds |
|---|---|---|
| Server state | TanStack Query v5 | Trips, user profile, subscription status, Places suggestions |
| Client/UI state | Zustand v5 | Auth session, trip form draft, global loading overlay |

**Rule:** Never use Zustand for data that comes from or belongs on a server. Never use TanStack Query for UI state that doesn't involve a network request.

---

## Zustand Stores

### `authStore.ts` — Session state

Persisted to SecureStore via a custom storage adapter. Drives the navigation guard.

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;    // false until SecureStore read completes on app launch
  setUser: (user: User) => void;
  clearUser: () => void;
}
```

`isHydrated` is critical — while `false`, the navigation guard renders `null` (keeps the splash screen visible). Prevents a flash of the auth screen before the persisted session loads.

---

### `tripFormStore.ts` — In-progress trip form

In-memory only. Intentionally **not persisted** — reset when the user navigates away from the Plan screen.

```typescript
interface TripFormState {
  destination: Location | null;
  startDate: Date | null;
  endDate: Date | null;
  interests: Interest[];
  budget: number | null;
  setDestination: (loc: Location) => void;
  toggleInterest: (interest: Interest) => void;
  setBudget: (amount: number) => void;
  reset: () => void;
}
```

---

### `uiStore.ts` — Global loading overlay

Transient UI coordination across screens (e.g., full-screen Lottie overlay during AI generation).

```typescript
interface UIState {
  isGlobalLoadingVisible: boolean;
  globalLoadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}
```

---

## TanStack Query

### Query Client (`src/lib/queryClient.ts`)

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Never retry 4xx errors — they won't resolve on retry
        if (error instanceof DomainError && error.type === 'AuthError') return false;
        if (error instanceof DomainError && error.type === 'NotFoundError') return false;
        return failureCount < 3;  // Retry up to 3x for 5xx / network errors
      },
      staleTime: 5 * 60 * 1000,  // 5 min default
      gcTime: 10 * 60 * 1000,    // Keep unused cache for 10 min
    },
    mutations: {
      retry: false,  // Never auto-retry mutations
    },
  },
});
```

---

### Query Keys Factory (`src/lib/queryKeys.ts`)

Centralized typed key factory. Prevents typos and enables precise cache invalidation.

```typescript
export const queryKeys = {
  trips: {
    all:    (userId: string)  => ['trips', userId]           as const,
    detail: (tripId: string)  => ['trips', 'detail', tripId] as const,
  },
  user: {
    profile: (userId: string) => ['user', 'profile', userId] as const,
  },
  subscription: {
    status: (userId: string)  => ['subscription', userId]    as const,
  },
  places: {
    autocomplete: (q: string) => ['places', 'autocomplete', q] as const,
  },
};
```

---

### Stale Times by Resource

| Resource | staleTime | Rationale |
|---|---|---|
| Trips list | 5 min | Only changes via user action |
| Trip detail | 10 min | Immutable after AI generation |
| Subscription status | 1 min | Must be fresh immediately post-purchase |
| Places autocomplete | 30 sec | User-session-specific, short-lived |

---

### Custom Query Hooks

View-models **never** call `useQuery` or `useMutation` directly. All TanStack Query usage is wrapped in custom hooks located in `src/hooks/`:

| Hook | Type | Description |
|---|---|---|
| `useTrips(userId)` | `useQuery` | Fetch trips list |
| `useTrip(tripId)` | `useQuery` | Fetch single trip detail |
| `useGenerateTrip()` | `useMutation` | Generate trip, invalidates `trips.all` on success |
| `useDeleteTrip()` | `useMutation` | Optimistic removal from cache, rollback on error |
| `useSubscriptionStatus(userId)` | `useQuery` | Current subscription tier |
| `usePlacesAutocomplete(query)` | `useQuery` | Debounced, `enabled: query.length > 2` |

### Example — Optimistic Delete

```typescript
export function useDeleteTrip() {
  return useMutation({
    mutationFn: (tripId: string) => tripApi.deleteTrip(tripId),

    onMutate: async (tripId) => {
      const { user } = useAuthStore.getState();
      const key = queryKeys.trips.all(user!.id);

      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Trip[]>(key);

      // Optimistically remove from cache
      queryClient.setQueryData<Trip[]>(key, old =>
        old?.filter(t => t.id !== tripId) ?? []
      );

      return { previous };
    },

    onError: (_err, _tripId, context) => {
      // Roll back on error
      const { user } = useAuthStore.getState();
      queryClient.setQueryData(queryKeys.trips.all(user!.id), context?.previous);
    },

    onSettled: () => {
      const { user } = useAuthStore.getState();
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.all(user!.id) });
    },
  });
}
```
