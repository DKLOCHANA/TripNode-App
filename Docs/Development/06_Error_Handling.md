# 06 — Error Handling

← [05_Theme_System](./05_Theme_System.md) | Next → [07_Security](./07_Security.md)

---

## DomainError Union Type (`src/errors/DomainError.ts`)

All errors in the presentation layer must be typed. **Never pass raw `Error` objects or `AxiosError` to the UI.**

```typescript
export type DomainError =
  | NetworkError
  | AuthError
  | ValidationError
  | NotFoundError;

// NetworkError — connection issues, timeouts, 5xx responses
export interface NetworkError {
  type: 'NetworkError';
  message: string;
  statusCode?: number;
  retryable: boolean;   // true for timeouts / 503, false for 400-level
}

// AuthError — 401 token expiry, invalid credentials, revoked sessions
export interface AuthError {
  type: 'AuthError';
  message: string;
  code: 'TOKEN_EXPIRED' | 'INVALID_CREDENTIALS' | 'SESSION_REVOKED';
}

// ValidationError — form or input constraint violations
export interface ValidationError {
  type: 'ValidationError';
  message: string;
  field?: string;       // which field failed, if applicable
}

// NotFoundError — trip deleted elsewhere, stale cache reference
export interface NotFoundError {
  type: 'NotFoundError';
  message: string;
  resourceId?: string;
}
```

---

## Axios Interceptor Error Normalisation

All HTTP errors are normalized to `DomainError` in `src/data/sources/remote/api/client.ts` before reaching the presentation layer.

```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      return handleTokenRefresh(error);    // see 08_API_Service_Layer.md
    }

    if (status === 429) {
      return handleRateLimit(error);       // exponential backoff
    }

    return Promise.reject(normalizeToDomainError(error));
  }
);

function normalizeToDomainError(error: AxiosError): DomainError {
  const status = error.response?.status;

  if (!error.response || error.code === 'ECONNABORTED') {
    return { type: 'NetworkError', message: 'Connection failed', retryable: true };
  }
  if (status === 401) {
    return { type: 'AuthError', message: 'Session expired', code: 'TOKEN_EXPIRED' };
  }
  if (status === 404) {
    return { type: 'NotFoundError', message: 'Resource not found' };
  }
  if (status && status >= 500) {
    return { type: 'NetworkError', message: 'Server error', statusCode: status, retryable: true };
  }
  return { type: 'NetworkError', message: 'Request failed', statusCode: status, retryable: false };
}
```

---

## Rate Limit Backoff (429 Handling)

AI endpoint and Google Places return 429s during development. Handle gracefully — never crash.

```typescript
async function handleRateLimit(error: AxiosError, attempt = 1): Promise<AxiosResponse> {
  if (attempt > 3) return Promise.reject(normalizeToDomainError(error));
  const delay = Math.pow(2, attempt) * 1000; // 2s → 4s → 8s
  await new Promise(resolve => setTimeout(resolve, delay));
  return axiosInstance.request(error.config!);
}
```

---

## Screen-Level Error Boundary (`src/errors/errorBoundary.tsx`)

Catches any unhandled render error at screen level. Prevents a full app crash from a single screen's error.

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface State { hasError: boolean; }

export class ScreenErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Send to crash reporting in Phase 6 (Sentry / Crashlytics)
    console.error('[ScreenErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Something went wrong.</Text>
          <Text style={styles.subtext}>Please restart the app.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.screen,
  },
  text: {
    fontSize: theme.typography.fontSize.title3,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  subtext: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
```

Wrap each screen stack in `app/(app)/_layout.tsx`:
```typescript
<ScreenErrorBoundary>
  <Stack />
</ScreenErrorBoundary>
```

---

## ErrorBanner Component

Inline error display used by all view-models. Maps `DomainError.type` to user-friendly messages.

```typescript
// Used in screens:
{error && <ErrorBanner error={error} onRetry={retryable ? refetch : undefined} />}
```

---

## Error Handling Rules

1. View-models catch `DomainError` and set local `error` state — never let errors propagate to the screen unhandled
2. `retryable: true` errors → show "Try Again" button
3. `retryable: false` errors → show support message
4. **Never** display raw `error.message` from `AxiosError` or Firebase directly to the user
5. `AuthError` with `TOKEN_EXPIRED` → sign out automatically, do not show an error banner
6. `ValidationError` → display inline on the relevant form field, not in a banner
