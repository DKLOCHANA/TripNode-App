import axios from 'axios';
import { GOOGLE_PLACES_API_KEY } from '@env';

const PLACES_BASE = 'https://places.googleapis.com/v1';

interface PlacePhoto {
  name: string;
}

interface PlaceDetailsResponse {
  photos?: PlacePhoto[];
}

interface PhotoMediaResponse {
  photoUri?: string;
}

interface TextSearchResponse {
  places?: Array<{
    id: string;
    photos?: PlacePhoto[];
  }>;
}

export async function getPlacePhotoUri(placeId: string): Promise<string | null> {
  if (!placeId) return null;

  try {
    const detailsResponse = await axios.get<PlaceDetailsResponse>(
      `${PLACES_BASE}/places/${placeId}`,
      {
        params: {
          fields: 'photos',
        },
        headers: {
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'photos',
        },
      }
    );

    const firstPhoto = detailsResponse.data.photos?.[0];
    if (!firstPhoto?.name) {
      return null;
    }

    const mediaResponse = await axios.get<PhotoMediaResponse>(
      `${PLACES_BASE}/${firstPhoto.name}/media`,
      {
        params: {
          maxWidthPx: 960,
          maxHeightPx: 540,
          skipHttpRedirect: true,
          key: GOOGLE_PLACES_API_KEY,
        },
      }
    );

    if (mediaResponse.data?.photoUri) {
      return mediaResponse.data.photoUri;
    }

    return `${PLACES_BASE}/${firstPhoto.name}/media?maxWidthPx=960&maxHeightPx=540&key=${encodeURIComponent(
      GOOGLE_PLACES_API_KEY
    )}`;
  } catch {
    return null;
  }
}

export async function searchPlaceAndGetPhoto(query: string): Promise<string | null> {
  if (!query) return null;

  try {
    const searchResponse = await axios.post<TextSearchResponse>(
      `${PLACES_BASE}/places:searchText`,
      {
        textQuery: query,
        maxResultCount: 1,
      },
      {
        headers: {
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.photos',
          'Content-Type': 'application/json',
        },
      }
    );

    const firstPlace = searchResponse.data.places?.[0];
    const firstPhoto = firstPlace?.photos?.[0];

    if (!firstPhoto?.name) {
      return null;
    }

    const mediaResponse = await axios.get<PhotoMediaResponse>(
      `${PLACES_BASE}/${firstPhoto.name}/media`,
      {
        params: {
          maxWidthPx: 400,
          maxHeightPx: 300,
          skipHttpRedirect: true,
          key: GOOGLE_PLACES_API_KEY,
        },
      }
    );

    if (mediaResponse.data?.photoUri) {
      return mediaResponse.data.photoUri;
    }

    return `${PLACES_BASE}/${firstPhoto.name}/media?maxWidthPx=400&maxHeightPx=300&key=${encodeURIComponent(
      GOOGLE_PLACES_API_KEY
    )}`;
  } catch {
    return null;
  }
}
