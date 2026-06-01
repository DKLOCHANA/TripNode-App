import axios from 'axios';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_OPENAI_API_KEY;
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

const OPENAI_MODEL = 'gpt-4o-mini';

// Minimum / target activities we promise per day, and how many attractions to
// suggest per trip day so there is enough supply to fill every day.
const MIN_ACTIVITIES_PER_DAY = 3;
const MAX_ACTIVITIES_PER_DAY = 5;
const ATTRACTIONS_PER_DAY = 5;
const MIN_ATTRACTION_SUGGESTIONS = 12;
const MAX_ATTRACTION_SUGGESTIONS = 25;

// JSON schema for the attraction-suggestions response (OpenAI structured outputs).
const ATTRACTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['destinationOverview', 'attractions'],
  properties: {
    destinationOverview: { type: 'string' },
    attractions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'name',
          'description',
          'category',
          'address',
          'latitude',
          'longitude',
          'estimatedDurationMinutes',
          'estimatedCostUsd',
          'bestTimeToVisit',
          'rating',
        ],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          address: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          estimatedDurationMinutes: { type: 'number' },
          estimatedCostUsd: { type: ['number', 'null'] },
          bestTimeToVisit: { type: 'string', enum: ['morning', 'afternoon', 'evening'] },
          rating: { type: 'number' },
        },
      },
    },
  },
} as const;

// JSON schema for the itinerary response (OpenAI structured outputs).
const ITINERARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['days'],
  properties: {
    days: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['dayNumber', 'date', 'activities'],
        properties: {
          dayNumber: { type: 'number' },
          date: { type: 'string' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: [
                'name',
                'description',
                'category',
                'address',
                'latitude',
                'longitude',
                'startTime',
                'endTime',
                'durationMinutes',
                'estimatedCostUsd',
              ],
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                address: { type: 'string' },
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                startTime: { type: 'string' },
                endTime: { type: 'string' },
                durationMinutes: { type: 'number' },
                estimatedCostUsd: { type: ['number', 'null'] },
              },
            },
          },
        },
      },
    },
  },
} as const;

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
      model: OPENAI_MODEL,
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
      max_tokens: 4000,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'attraction_suggestions',
          strict: true,
          schema: ATTRACTION_SCHEMA,
        },
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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
  const tripDays = calculateDays(request.startDate, request.endDate);
  // We can't promise more activities/day than the supply allows when building
  // strictly from the user's selection, so target the lesser of our minimum
  // and an even split of what was selected.
  const minPerDay = Math.min(
    MIN_ACTIVITIES_PER_DAY,
    Math.max(1, Math.floor(selectedAttractions.length / tripDays))
  );

  const first = await requestItinerary(request, selectedAttractions);
  if (isItineraryComplete(first, tripDays, minPerDay)) {
    return first;
  }

  // One reinforced retry if any day came back empty/thin or a day is missing.
  const retry = await requestItinerary(request, selectedAttractions, tripDays, minPerDay);
  // Return whichever attempt is more complete; never hard-fail the user flow.
  return countScheduled(retry) >= countScheduled(first) ? retry : first;
}

/**
 * Single OpenAI call that produces an itinerary. `reinforceMinPerDay` appends a
 * stronger instruction used only on the retry attempt.
 */
async function requestItinerary(
  request: TripGenerationRequest,
  selectedAttractions: GeneratedAttraction[],
  reinforceTripDays?: number,
  reinforceMinPerDay?: number
): Promise<GeneratedItinerary> {
  let prompt = buildItineraryPrompt(request, selectedAttractions);
  if (reinforceTripDays && reinforceMinPerDay) {
    prompt += `\n\nIMPORTANT: The previous attempt left one or more days empty or with too few activities. You MUST return exactly ${reinforceTripDays} days (dayNumber 1 to ${reinforceTripDays}), and every single day must contain at least ${reinforceMinPerDay} activities. Do not leave any day empty.`;
  }

  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: OPENAI_MODEL,
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
      max_tokens: 8000,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'itinerary',
          strict: true,
          schema: ITINERARY_SCHEMA,
        },
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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

/** True when every expected day exists and has at least `minPerDay` activities. */
function isItineraryComplete(
  itinerary: GeneratedItinerary,
  tripDays: number,
  minPerDay: number
): boolean {
  if (!itinerary?.days || itinerary.days.length < tripDays) {
    return false;
  }
  return itinerary.days
    .slice(0, tripDays)
    .every((day) => (day.activities?.length ?? 0) >= minPerDay);
}

/** Total scheduled activities across all days (used to pick the better attempt). */
function countScheduled(itinerary: GeneratedItinerary): number {
  return (itinerary?.days ?? []).reduce(
    (sum, day) => sum + (day.activities?.length ?? 0),
    0
  );
}

function buildAttractionPrompt(request: TripGenerationRequest): string {
  const { destination, startDate, endDate, interests, budgetUsd } = request;
  const tripDays = calculateDays(startDate, endDate);
  // Scale the number of suggestions to the trip length so there are enough
  // places to fill every day at 3-5 activities/day.
  const targetCount = Math.min(
    MAX_ATTRACTION_SUGGESTIONS,
    Math.max(MIN_ATTRACTION_SUGGESTIONS, tripDays * ATTRACTIONS_PER_DAY)
  );

  return `Generate travel attraction suggestions for a trip to ${destination.name}.

Trip Details:
- Destination: ${destination.name}
- Duration: ${tripDays} days (${startDate} to ${endDate})
- Interests: ${interests.join(', ')}
- Budget: ${budgetUsd ? `$${budgetUsd} USD total` : 'Flexible'}

Requirements:
1. Suggest at least ${targetCount} attractions that match the user's interests. This is a ${tripDays}-day trip, so there must be enough places to fill every day with 3-5 activities.
2. Include a mix of popular landmarks and hidden gems
3. Spread suggestions so the full ${tripDays} days can be filled - do NOT suggest fewer than ${targetCount}
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
1. Produce EXACTLY ${tripDays} days, with dayNumber 1 through ${tripDays}. Every day MUST contain activities - never leave a day empty.
2. Each day must have at least ${MIN_ACTIVITIES_PER_DAY} and at most ${MAX_ACTIVITIES_PER_DAY} activities. Distribute the selected attractions evenly across all ${tripDays} days.
3. Set each day's date by adding (dayNumber - 1) days to the start date ${startDate}, so dates are correct and sequential.
4. Group nearby attractions together to minimize travel, and consider the best time to visit for each.
5. Include realistic start/end times (9:00 AM to 8:00 PM) and allow travel time between locations (30-60 min gaps).

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
