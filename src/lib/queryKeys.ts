export const queryKeys = {
  trips: {
    all: (userId: string) => ['trips', userId] as const,
    detail: (tripId: string) => ['trips', 'detail', tripId] as const,
    cardPhoto: (tripId: string) => ['trips', 'cardPhoto', tripId] as const,
  },
  user: {
    profile: (userId: string) => ['user', 'profile', userId] as const,
  },
  subscription: {
    status: (userId: string) => ['subscription', userId] as const,
  },
  places: {
    autocomplete: (q: string) => ['places', 'autocomplete', q] as const,
    photo: (placeId: string) => ['places', 'photo', placeId] as const,
  },
} as const;
