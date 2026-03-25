import axios from 'axios';
import { EXPO_PUBLIC_FIREBASE_OPENAI_API_KEY } from '@env';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface TripGenerationRequest {
  destination: {
    name: string;
    placeId: string;
    latitude: number;
    longitude: number;
  };
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  interests: string[];
  budgetUsd: number | null;
}

export interface GeneratedAttraction {
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedDurationMinutes: number;
  estimatedCostUsd: number | null;
  bestTimeToVisit: 'morning' | 'afternoon' | 'evening';
  rating: number;
}

export interface AttractionSuggestionsResponse {
  attractions: GeneratedAttraction[];
  destinationOverview: string;
}

export interface GeneratedItinerary {
  days: GeneratedDay[];
}

export interface GeneratedDay {
  dayNumber: number;
  date: string;
  activities: GeneratedActivity[];
}

export interface GeneratedActivity {
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  durationMinutes: number;
  estimatedCostUsd: number | null;
}

/**
 * Generate attraction suggestions for a destination
 */
export async function generateAttractionSuggestions(
  request: TripGenerationRequest
): Promise<AttractionSuggestionsResponse> {
  const prompt = buildAttractionPrompt(request);
  
  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert travel planner AI. You provide detailed, accurate travel recommendations based on user preferences. Always respond with valid JSON only, no markdown or extra text.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EXPO_PUBLIC_FIREBASE_OPENAI_API_KEY}`,
      },
    }
  );

  const content = response.data.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  try {
    return JSON.parse(content);
  } catch {
    // Try to extract JSON from markdown code block
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    throw new Error('Failed to parse AI response');
  }
}

/**
 * Generate a complete itinerary from selected attractions
 */
export async function generateItinerary(
  request: TripGenerationRequest,
  selectedAttractions: GeneratedAttraction[]
): Promise<GeneratedItinerary> {
  const prompt = buildItineraryPrompt(request, selectedAttractions);
  
  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert travel planner AI. Create optimized daily itineraries that minimize travel time between locations. Always respond with valid JSON only, no markdown or extra text.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EXPO_PUBLIC_FIREBASE_OPENAI_API_KEY}`,
      },
    }
  );

  const content = response.data.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    throw new Error('Failed to parse AI response');
  }
}

function buildAttractionPrompt(request: TripGenerationRequest): string {
  const { destination, startDate, endDate, interests, budgetUsd } = request;
  const tripDays = calculateDays(startDate, endDate);
  
  return `Generate travel attraction suggestions for a trip to ${destination.name}.

Trip Details:
- Destination: ${destination.name}
- Duration: ${tripDays} days (${startDate} to ${endDate})
- Interests: ${interests.join(', ')}
- Budget: ${budgetUsd ? `$${budgetUsd} USD total` : 'Flexible'}

Requirements:
1. Suggest 10-15 attractions that match the user's interests
2. Include a mix of popular landmarks and hidden gems
3. Consider the trip duration - don't suggest more than can be visited
4. Include practical details like duration and cost estimates

Respond with this exact JSON structure:
{
  "destinationOverview": "Brief 2-sentence overview of the destination",
  "attractions": [
    {
      "name": "Attraction name",
      "description": "2-3 sentence description of why to visit",
      "category": "culture|foodie|adventure|relax|shopping|nightlife|history|wellness|beach|photography|nature|landmark",
      "address": "Full address",
      "latitude": 0.0,
      "longitude": 0.0,
      "estimatedDurationMinutes": 60,
      "estimatedCostUsd": 25,
      "bestTimeToVisit": "morning|afternoon|evening",
      "rating": 4.5
    }
  ]
}`;
}

function buildItineraryPrompt(
  request: TripGenerationRequest,
  attractions: GeneratedAttraction[]
): string {
  const { destination, startDate, endDate, budgetUsd } = request;
  const tripDays = calculateDays(startDate, endDate);
  
  const attractionsList = attractions
    .map((a, i) => `${i + 1}. ${a.name} (${a.bestTimeToVisit}, ${a.estimatedDurationMinutes}min, ${a.address})`)
    .join('\n');

  return `Create a detailed ${tripDays}-day itinerary for ${destination.name} using these selected attractions:

${attractionsList}

Trip Details:
- Start Date: ${startDate}
- End Date: ${endDate}
- Budget: ${budgetUsd ? `$${budgetUsd} USD` : 'Flexible'}

Requirements:
1. Create a logical day-by-day schedule
2. Group nearby attractions together to minimize travel
3. Consider best time to visit for each attraction
4. Include realistic start/end times (9:00 AM to 8:00 PM)
5. Allow for travel time between locations (30-60 min gaps)
6. Don't overschedule - 4-6 activities per day maximum

Respond with this exact JSON structure:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "${startDate}",
      "activities": [
        {
          "name": "Attraction name",
          "description": "Brief activity description",
          "category": "category",
          "address": "Full address",
          "latitude": 0.0,
          "longitude": 0.0,
          "startTime": "09:00",
          "endTime": "10:30",
          "durationMinutes": 90,
          "estimatedCostUsd": 25
        }
      ]
    }
  ]
}`;
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
