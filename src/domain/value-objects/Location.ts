export interface Location {
  readonly placeId: string;
  readonly name: string;
  readonly formattedAddress: string;
  readonly coordinates: {
    latitude: number;
    longitude: number;
  };
  readonly ianaTimezone: string; // e.g. "Asia/Tokyo"
}

export function createLocation(params: {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  ianaTimezone?: string;
}): Location {
  return {
    placeId: params.placeId,
    name: params.name,
    formattedAddress: params.formattedAddress,
    coordinates: {
      latitude: params.latitude,
      longitude: params.longitude,
    },
    ianaTimezone: params.ianaTimezone || 'UTC',
  };
}
