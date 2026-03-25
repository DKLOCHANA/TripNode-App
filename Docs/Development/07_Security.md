# 07 — Security

← [06_Error_Handling](./06_Error_Handling.md) | Next → [08_API_Service_Layer](./08_API_Service_Layer.md)

---

## Input Sanitization

All user input must be sanitized **client-side** before being sent to the AI endpoint. The AI prompt is constructed server-side, but the client validates and strips dangerous content first.

```typescript
// src/lib/validation.ts

export function sanitizeTextInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')          // strip angle brackets (basic XSS prevention)
    .replace(/\n{3,}/g, '\n\n')    // collapse excessive newlines
    .slice(0, 500);                // enforce hard max length
}

// Applied in usePlanTripViewModel before triggering the mutation:
const sanitizedDestination = sanitizeTextInput(destination.name);
```

---

## Token Security

**Rule:** JWTs are stored exclusively in `expo-secure-store`. Never in `AsyncStorage`, component state, React context, or logs.

### `SecureStoreService` (`src/data/sources/local/secureStore.ts`)

This is the **only** file that imports `expo-secure-store`. No other file touches token storage directly.

```typescript
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'tripnode_auth_token';
const REFRESH_TOKEN_KEY = 'tripnode_refresh_token';

export const SecureStoreService = {
  getToken:        () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken:        (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clearToken:      () => SecureStore.deleteItemAsync(TOKEN_KEY),

  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
  clearRefreshToken: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
};
```

### Token Clearing Requirements

Both logout and account deletion must clear tokens:

| Event | Required Actions |
|---|---|
| Sign out | `SecureStoreService.clearToken()` + `SecureStoreService.clearRefreshToken()` + `authStore.clearUser()` |
| Account deletion | Same as sign out + `RevenueCat.logOut()` + `queryClient.clear()` |

**Never log token values** — even in `__DEV__` mode. Use `'[token present]'` as a placeholder if debug logging is needed.

---

## API Rate Limit Awareness

- `usePlacesAutocomplete` is debounced at **350ms** — do not lower this threshold
- Google Places session tokens prevent per-keystroke billing — never disable them
- AI generation is a **single mutation**, not a polling loop — do not add retry logic to `GenerateTripUseCase` itself; let the Axios interceptor handle 429 backoff
- Places autocomplete only fires when `query.length > 2` — prevents wasted API calls on single characters

---

## Environment Variable Rules

```bash
# .env (committed — EXPO_PUBLIC_ prefix bundles into JS)
EXPO_PUBLIC_API_BASE_URL=https://api.tripnode.app
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIza...
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...

# .env.local (gitignored — developer overrides)
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# Firebase credentials → GoogleService-Info.plist
# This is a native file added to the iOS project, NOT an env var.
# Never put Firebase config in .env.

# AI API key (OpenAI / Gemini) → backend server ONLY
# This key must NEVER appear in the client bundle.
```

### What EXPO_PUBLIC_ Means

`EXPO_PUBLIC_` variables are **bundled into the JavaScript** and are visible to anyone who decompiles the app binary. Do not put truly secret values here. Acceptable: Places API key (can be restricted by bundle ID in Google Cloud Console), RevenueCat public key. Not acceptable: OpenAI secret key, database admin credentials.

---

## Firestore Security Rules

To be deployed before Phase 6 launch. Users can only access their own data.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // User profiles — only the owner
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Trips — only the owner
    match /trips/{userId}/items/{tripId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
