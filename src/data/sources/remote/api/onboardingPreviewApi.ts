import axios from 'axios';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_OPENAI_API_KEY;

/**
 * Onboarding "Day 1 preview" generator.
 *
 * Standalone on purpose: the existing trip-generation AI (openaiApi.ts) needs a
 * fully structured request (placeId, dates, selected attractions) that the
 * onboarding destination screen does not have. This reuses the same OpenAI
 * endpoint / key / JSON-parse pattern without touching that code, and produces
 * exactly the shape screen 21 renders.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface PreviewActivity {
  emoji: string;
  title: string;
  note: string;
  durationMinutes: number;
  /** null / 0 means Free. */
  costUsd: number | null;
}

export interface PreviewDay {
  /** True when this came from the curated fallback (AI failed). */
  isFallback: boolean;
  morning: PreviewActivity[];
  afternoon: PreviewActivity[];
}

export interface PreviewRequest {
  destination: string;
  /** Screen-10 priorities (free phrases). */
  interests: string[];
  /** Screen-13 budget style phrase. */
  budgetStyle: string | null;
}

/** "1h 30m · Free" / "2h · ~$30" — used by the itinerary cards. */
export function formatPreviewMeta(a: PreviewActivity): string {
  const h = Math.floor(a.durationMinutes / 60);
  const m = a.durationMinutes % 60;
  const duration = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  const cost = a.costUsd == null || a.costUsd <= 0 ? 'Free' : `~$${a.costUsd}`;
  return `${duration} · ${cost}`;
}

function buildPrompt(req: PreviewRequest): string {
  const interests = req.interests.length
    ? req.interests.join(', ')
    : 'a mix of culture, food and iconic sights';
  const budget = req.budgetStyle ? req.budgetStyle : 'balanced spending';

  return `Plan a realistic Day 1 for a traveler visiting ${req.destination}.

Traveler profile:
- What they care about: ${interests}
- Budget style: ${budget}

Rules:
- Use REAL, well-known places that genuinely exist in ${req.destination}.
- 2 morning activities and 2 afternoon activities.
- Each "note" is a punchy insider tip, max 12 words, no period at the end (e.g. "arrive early for the quiet before the crowds").
- "durationMinutes" realistic (30–180). "costUsd" is an integer USD estimate, 0 if free.
- Pick a fitting emoji per activity (single emoji).
- Match the activities to the traveler's interests and budget style.

Respond with ONLY this JSON (no markdown, no commentary):
{
  "morning": [
    { "emoji": "🏛️", "title": "Place name", "note": "insider tip", "durationMinutes": 90, "costUsd": 0 }
  ],
  "afternoon": [
    { "emoji": "🍣", "title": "Place name", "note": "insider tip", "durationMinutes": 120, "costUsd": 30 }
  ]
}`;
}

function coerceActivity(raw: unknown): PreviewActivity | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const title = typeof r.title === 'string' ? r.title.trim() : '';
  if (!title) return null;

  const durationMinutes =
    typeof r.durationMinutes === 'number' && r.durationMinutes > 0
      ? Math.round(r.durationMinutes)
      : 60;

  let costUsd: number | null = null;
  if (typeof r.costUsd === 'number') costUsd = Math.max(0, Math.round(r.costUsd));
  else if (typeof r.costUsd === 'string') {
    const n = parseInt(r.costUsd.replace(/[^0-9]/g, ''), 10);
    costUsd = Number.isFinite(n) ? n : null;
  }

  return {
    emoji: typeof r.emoji === 'string' && r.emoji.trim() ? r.emoji.trim() : '📍',
    title,
    note: typeof r.note === 'string' ? r.note.trim() : '',
    durationMinutes,
    costUsd,
  };
}

function parsePreview(content: string): PreviewDay {
  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!match) throw new Error('Unparseable AI response');
    json = JSON.parse(match[1].trim());
  }

  const obj = json as Record<string, unknown>;
  const morning = Array.isArray(obj.morning)
    ? obj.morning.map(coerceActivity).filter((a): a is PreviewActivity => a !== null)
    : [];
  const afternoon = Array.isArray(obj.afternoon)
    ? obj.afternoon.map(coerceActivity).filter((a): a is PreviewActivity => a !== null)
    : [];

  if (morning.length === 0 && afternoon.length === 0) {
    throw new Error('AI response had no activities');
  }

  return {
    isFallback: false,
    morning: morning.slice(0, 2),
    afternoon: afternoon.slice(0, 2),
  };
}

/** Single AI attempt — throws on network/parse/empty failure. */
export async function generatePreviewDay(req: PreviewRequest): Promise<PreviewDay> {
  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert local travel planner. You only know real places. Always respond with valid JSON only, no markdown or extra text.',
        },
        { role: 'user', content: buildPrompt(req) },
      ],
      temperature: 0.7,
      max_tokens: 800,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      timeout: 20_000,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response from AI');
  return parsePreview(content);
}

/**
 * Generic, destination-agnostic Day 1 used only when the AI fails twice.
 * Reads naturally for any place (no fake "Senso-ji in Paris").
 */
export function buildFallbackDay(destination: string): PreviewDay {
  const place = destination.trim() || 'your destination';
  return {
    isFallback: true,
    morning: [
      {
        emoji: '🏛️',
        title: `${place} Old Town`,
        note: 'start early to wander the historic streets before the crowds',
        durationMinutes: 90,
        costUsd: 0,
      },
      {
        emoji: '☕',
        title: 'Local café & market',
        note: 'grab breakfast where the locals actually go',
        durationMinutes: 60,
        costUsd: 15,
      },
    ],
    afternoon: [
      {
        emoji: '📸',
        title: `${place} signature landmark`,
        note: 'the one view everyone remembers — worth the visit',
        durationMinutes: 120,
        costUsd: 25,
      },
      {
        emoji: '🌇',
        title: 'Sunset viewpoint',
        note: 'end the day high up as the city lights come on',
        durationMinutes: 75,
        costUsd: 0,
      },
    ],
  };
}

/**
 * Resilient generator for onboarding: one attempt, one retry, then the
 * generic fallback. Never throws — onboarding must always continue.
 */
export async function generatePreviewDayResilient(
  req: PreviewRequest
): Promise<PreviewDay> {
  try {
    return await generatePreviewDay(req);
  } catch {
    try {
      return await generatePreviewDay(req);
    } catch {
      return buildFallbackDay(req.destination);
    }
  }
}
