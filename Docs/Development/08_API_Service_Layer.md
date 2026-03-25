# 08 — API Service Layer

← [07_Security](./07_Security.md) | Next → [09_Timezone_Handling](./09_Timezone_Handling.md)

---

## Axios Client (`src/data/sources/remote/api/client.ts`)

Singleton Axios instance. All API calls go through this — no direct `fetch()` calls anywhere.

```typescript
import axios, { AxiosError, AxiosResponse } from 'axios';
import { SecureStoreService } from '@/data/sources/local/secureStore';
import { normalizeToDomainError, handleTokenRefresh, handleRateLimit } from './interceptors';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: inject Bearer token ──
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStoreService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle errors ──
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) return handleTokenRefresh(error);
    if (status === 429) return handleRateLimit(error);

    return Promise.reject(normalizeToDomainError(error));
  }
);
```

### Token Refresh Flow (401 Handling)

```typescript
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function handleTokenRefresh(originalError: AxiosError): Promise<AxiosResponse> {
  if (isRefreshing) {
    // Queue the request — resolve when refresh completes
    return new Promise((resolve) => {
      refreshQueue.push((newToken) => {
        originalError.config!.headers!.Authorization = `Bearer ${newToken}`;
        resolve(apiClient.request(originalError.config!));
      });
    });
  }

  isRefreshing = true;
  try {
    const refreshToken = await SecureStoreService.getRefreshToken();
    const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    await SecureStoreService.setToken(data.accessToken);
    refreshQueue.forEach(cb => cb(data.accessToken));
    refreshQueue = [];

    originalError.config!.headers!.Authorization = `Bearer ${data.accessToken}`;
    return apiClient.request(originalError.config!);
  } catch {
    // Refresh failed — force sign out
    await SecureStoreService.clearToken();
    await SecureStoreService.clearRefreshToken();
    useAuthStore.getState().clearUser();
    // Router navigation happens in the auth store subscriber
    return Promise.reject({ type: 'AuthError', code: 'SESSION_REVOKED', message: 'Session expired' });
  } finally {
    isRefreshing = false;
  }
}
```

---

## Service Modules

Plain async functions — no classes. Each function takes typed parameters and returns typed responses.

### `authApi.ts`

```typescript
export const authApi = {
  signInWithEmail: (email: string, password: string): Promise<AuthResponseDto> =>
    apiClient.post('/auth/login', { email, password }).then(r => r.data),

  register: (email: string, password: string, name: string): Promise<AuthResponseDto> =>
    apiClient.post('/auth/register', { email, password, name }).then(r => r.data),

  refreshToken: (refreshToken: string): Promise<TokenDto> =>
    apiClient.post('/auth/refresh', { refreshToken }).then(r => r.data),

  deleteAccount: (): Promise<void> =>
    apiClient.delete('/auth/account').then(() => undefined),
};
```

### `tripApi.ts`

```typescript
export const tripApi = {
  generateTrip: (params: GenerateTripRequestDto): Promise<TripDto> =>
    apiClient.post('/trips/generate', params).then(r => r.data),

  getTrips: (userId: string): Promise<TripDto[]> =>
    apiClient.get(`/trips/${userId}`).then(r => r.data),

  getTripById: (tripId: string): Promise<TripDto> =>
    apiClient.get(`/trips/detail/${tripId}`).then(r => r.data),

  deleteTrip: (tripId: string): Promise<void> =>
    apiClient.delete(`/trips/${tripId}`).then(() => undefined),
};
```

### `userApi.ts`

```typescript
export const userApi = {
  getProfile: (userId: string): Promise<UserDto> =>
    apiClient.get(`/users/${userId}`).then(r => r.data),

  updateProfile: (userId: string, data: Partial<UserDto>): Promise<UserDto> =>
    apiClient.patch(`/users/${userId}`, data).then(r => r.data),
};
```

---

## Google Places API (`src/data/sources/remote/google/placesApi.ts`)

Uses the **New Places API** (not legacy) with session tokens for billing efficiency.

```typescript
const PLACES_BASE = 'https://places.googleapis.com/v1';

export const placesApi = {
  autocomplete: async (
    query: string,
    sessionToken: string
  ): Promise<PlaceSuggestionDto[]> => {
    const response = await axios.post(
      `${PLACES_BASE}/places:autocomplete`,
      { input: query, sessionToken },
      {
        headers: {
          'X-Goog-Api-Key': process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.suggestions ?? [];
  },

  getPlaceDetails: async (
    placeId: string,
    sessionToken: string
  ): Promise<PlaceDetailDto> => {
    const response = await axios.get(
      `${PLACES_BASE}/places/${placeId}`,
      {
        params: {
          fields: 'displayName,formattedAddress,location,utcOffsetMinutes,timeZone',
        },
        headers: {
          'X-Goog-Api-Key': process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'displayName,formattedAddress,location,timeZone',
          'X-Goog-SessionToken': sessionToken,
        },
      }
    );
    return response.data;
  },
};
```

### Session Token Strategy

A session token is a UUID generated **on input focus**. The same token accompanies all autocomplete requests until the user selects a place. On selection, `getPlaceDetails()` is called with the same token — then the token is discarded and a new one generated next time the input is focused.

This groups all calls in a session into a **single billable event**, reducing Google Places costs.

```typescript
// In DestinationSearchInput.tsx view-model:
const [sessionToken, setSessionToken] = useState(() => uuid());

const onInputFocus = () => {
  setSessionToken(uuid());  // fresh token per session
};

const onPlaceSelected = async (placeId: string) => {
  const detail = await placesApi.getPlaceDetails(placeId, sessionToken);
  // sessionToken is now "used" — next focus generates a new one
  tripFormStore.setDestination(PlaceDetailMapper.toDomain(detail));
};
```

---

## AI Trip Generation Endpoint

The AI endpoint lives on the **backend server** (Node.js / Edge Function). The client sends structured parameters; the server builds the AI prompt, calls OpenAI/Gemini, and returns a structured `TripDto`.

**Client → Backend request shape:**
```typescript
interface GenerateTripRequestDto {
  destination: {
    placeId: string;
    name: string;
    formattedAddress: string;
    coordinates: { latitude: number; longitude: number };
    ianaTimezone: string;
  };
  startDateUtc: string;   // ISO 8601
  endDateUtc: string;
  interests: string[];
  budgetUsd: number;
}
```

**Backend → Client response shape:**
```typescript
interface TripDto {
  id: string;
  destination: DestinationDto;
  dateRange: { startDateUtc: string; endDateUtc: string };
  days: ItineraryDayDto[];
  createdAt: string;
}

interface ItineraryDayDto {
  dayNumber: number;
  date: string;
  activities: ActivityDto[];
}

interface ActivityDto {
  id: string;
  name: string;
  description: string;      // 2 sentences from AI
  timeSlot: 'morning' | 'afternoon' | 'evening';
  estimatedTimeUtc: string; // UTC ISO, displayed in destination tz
  estimatedDurationMinutes: number;
  estimatedCostUsd: number;
  location: {
    name: string;
    coordinates: { latitude: number; longitude: number };
  };
  category: string;
}
```
