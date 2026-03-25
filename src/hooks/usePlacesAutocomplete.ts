import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { queryKeys } from '@/lib/queryKeys';
import { PLACES_DEBOUNCE_MS } from '@/lib/constants';

/**
 * Google Places autocomplete API interface
 * Using the New Places API
 */
interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

interface PlacesAutocompleteResult {
  predictions: PlacePrediction[];
  sessionToken: string;
}

const PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';
const PLACES_BASE_URL = 'https://places.googleapis.com/v1';

/**
 * Fetch place autocomplete suggestions from Google Places API (New)
 */
async function fetchPlaceSuggestions(
  query: string,
  sessionToken: string
): Promise<PlacePrediction[]> {
  if (!PLACES_API_KEY || !query || query.length < 3) {
    return [];
  }

  try {
    const response = await fetch(`${PLACES_BASE_URL}/places:autocomplete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
      },
      body: JSON.stringify({
        input: query,
        sessionToken,
        includedPrimaryTypes: ['locality', 'administrative_area_level_1', 'country'],
      }),
    });

    if (!response.ok) {
      throw new Error('Places API request failed');
    }

    const data = await response.json();
    
    return (data.suggestions || []).map((suggestion: any) => ({
      placeId: suggestion.placePrediction?.placeId || '',
      mainText: suggestion.placePrediction?.structuredFormat?.mainText?.text || '',
      secondaryText: suggestion.placePrediction?.structuredFormat?.secondaryText?.text || '',
      fullText: suggestion.placePrediction?.text?.text || '',
    }));
  } catch (error) {
    console.error('Places autocomplete error:', error);
    return [];
  }
}

/**
 * Generate a random session token for Places API billing optimization
 */
function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Hook for Google Places autocomplete with debouncing
 */
export function usePlacesAutocomplete(enabled = true) {
  const [query, setQuery] = useState('');
  const [sessionToken, setSessionToken] = useState(() => generateSessionToken());
  
  const debouncedQuery = useDebounce(query, PLACES_DEBOUNCE_MS);

  // Generate new session token when query is cleared
  const resetSession = useCallback(() => {
    setSessionToken(generateSessionToken());
  }, []);

  // Clear query and reset session
  const clear = useCallback(() => {
    setQuery('');
    resetSession();
  }, [resetSession]);

  const queryResult = useQuery({
    queryKey: queryKeys.places.autocomplete(debouncedQuery),
    queryFn: () => fetchPlaceSuggestions(debouncedQuery, sessionToken),
    enabled: enabled && debouncedQuery.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
  });

  return {
    query,
    setQuery,
    predictions: queryResult.data ?? [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    clear,
    resetSession,
    sessionToken,
  };
}
