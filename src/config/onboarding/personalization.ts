/**
 * Personalization engine.
 *
 * Pure functions that turn the user's onboarding answers into the copy shown on
 * the reflection / insight / snapshot / plan-reveal / dynamic screens. Keeping
 * this isolated means the screen renderers stay dumb and the "perceived
 * personalization" logic has one home.
 */

import { format, addDays } from 'date-fns';

interface Answers {
  userName: string;
  planHabit: string | null;
  priorities: string[];
  tripProblem: string | null;
  budgetStyle: string | null;
  missedBest: 'yes' | 'no' | null;
  destination: string;
  commitment: string | null;
}

const FALLBACK_NAME = 'traveler';

export function displayName(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : FALLBACK_NAME;
}

/** Interpolate `{name}` / `{destination}` tokens inside any copy string. */
export function interpolate(text: string, a: Pick<Answers, 'userName' | 'destination'>): string {
  return text
    .replace(/\{name\}/g, displayName(a.userName))
    .replace(/\{destination\}/g, displayDestination(a.destination));
}

export function displayDestination(destination: string): string {
  const trimmed = destination.trim();
  return trimmed.length > 0 ? trimmed : 'your destination';
}

/* ------------------------------------------------------------------ */
/* Screen 12 — goals reflection                                        */
/* ------------------------------------------------------------------ */

const GOAL_LINES = [
  "that's the stuff trips are made of",
  'we know just the spots',
  'consider it handled',
];

export interface GoalsReflection {
  title: string;
  goals: { label: string; note: string }[];
  currentState: string;
  closing: string[];
}

export function buildGoalsReflection(a: Answers): GoalsReflection {
  const goals = a.priorities.slice(0, 3).map((label, i) => ({
    label,
    note: GOAL_LINES[i] ?? GOAL_LINES[GOAL_LINES.length - 1],
  }));
  return {
    title: `sounds like you know what you want, ${displayName(a.userName)}.`,
    goals,
    currentState: a.tripProblem ?? 'the thing that keeps tripping you up',
    closing: [
      'and the thing that keeps going wrong?',
      'thousands of travelers started exactly here. let’s fix that.',
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Screen 15 — emotional reflection                                    */
/* ------------------------------------------------------------------ */

export interface EmotionalReflection {
  title: string;
  blocker: string;
  midline: string;
  closing: string;
}

export function buildEmotionalReflection(a: Answers): EmotionalReflection {
  const yes = a.missedBest === 'yes';
  return {
    title: `we hear you, ${displayName(a.userName)}.`,
    blocker: a.tripProblem ?? 'what keeps going wrong',
    midline: yes
      ? 'you’ve felt it before. it won’t happen again.'
      : 'the fact that you’re thinking ahead says everything.',
    closing: 'your next trip will be different.',
  };
}

/* ------------------------------------------------------------------ */
/* Screen 16 — insight cards                                           */
/* ------------------------------------------------------------------ */

const CURRENT_STATE_SHORT: Record<string, string> = {
  'I always blow my budget': 'Overspending, no plan',
  'I waste time at overhyped tourist traps': 'Wrong spots, wasted time',
  "I miss the best spots because I didn't plan enough": 'Missing the best places',
  'I over-plan and it stops being fun': 'Over-planning burnout',
  'I wing it and regret it later': 'Winging it, regret later',
};

export interface InsightCards {
  title: string;
  cards: { label: string; value: string }[];
  closing: string;
}

export function buildInsightCards(a: Answers): InsightCards {
  const priorities = a.priorities.length
    ? a.priorities.join('  ·  ')
    : 'experiences that matter to you';
  const tripping = a.tripProblem
    ? CURRENT_STATE_SHORT[a.tripProblem] ?? a.tripProblem
    : 'Wasted time, wrong spots';
  const blocker =
    a.missedBest === 'no'
      ? 'Always afraid you’ll miss out'
      : 'Fear of missing the best parts';

  return {
    title: `thanks ${displayName(a.userName)}. here’s what we know about how you travel.`,
    cards: [
      { label: 'Where you want to go', value: priorities },
      { label: 'What keeps tripping you up', value: tripping },
      { label: 'What’s holding you back', value: blocker },
    ],
    closing: 'let’s build trips where none of that happens.',
  };
}

/* ------------------------------------------------------------------ */
/* Screen 26 — travel snapshot (DNA)                                   */
/* ------------------------------------------------------------------ */

const EXPLORER_PRIORITIES = new Set([
  'eating where the locals eat',
  'history and culture that gives you chills',
  'getting off the beaten path',
  'wellness and recharging',
]);

const PLANNING_CONFIDENCE: Record<string, number> = {
  'I wing it and regret it later': 24,
  'I always blow my budget': 34,
  "I miss the best spots because I didn't plan enough": 40,
  'I waste time at overhyped tourist traps': 46,
  'I over-plan and it stops being fun': 62,
};

export interface SnapshotData {
  title: string;
  /** 0 = full tourist, 100 = full explorer. */
  travelStylePct: number;
  budgetInstinct: string;
  planningConfidencePct: number;
  strengths: string[];
}

export function buildSnapshot(a: Answers): SnapshotData {
  let travelStylePct = 50;
  if (a.priorities.length > 0) {
    const explorer = a.priorities.filter((p) => EXPLORER_PRIORITIES.has(p)).length;
    const ratio = explorer / a.priorities.length; // 0..1
    travelStylePct = Math.round(30 + ratio * 55); // keep within 30–85
  }

  return {
    title: `${displayName(a.userName)}'s travel snapshot`,
    travelStylePct,
    budgetInstinct: a.budgetStyle ?? 'balanced — smart spending',
    planningConfidencePct: a.tripProblem
      ? PLANNING_CONFIDENCE[a.tripProblem] ?? 35
      : 35,
    strengths: [
      'you know what you want from a trip',
      'you’re willing to try something new',
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Screen 28 — dynamic commitment response                             */
/* ------------------------------------------------------------------ */

interface CommitmentResponse {
  emoji: string;
  headline: string;
  body: string;
}

const COMMITMENT_RESPONSES: Record<string, CommitmentResponse> = {
  'Extremely Committed': {
    emoji: '🔥',
    headline: 'that’s the energy, {name}.',
    body: 'your next trip won’t just be good — it’ll be the one you tell everyone about.',
  },
  'Very Committed': {
    emoji: '💪',
    headline: 'let’s make it happen.',
    body: 'great trips don’t happen by accident. {name}, you’re already ahead.',
  },
  'Somewhat Committed': {
    emoji: '🤔',
    headline: 'that’s more than enough.',
    body: 'even a little planning goes a long way. we’ll handle the hard part.',
  },
  'A Little Committed': {
    emoji: '🌱',
    headline: 'no pressure.',
    body: 'explore at your own pace. TripNode is here when you’re ready.',
  },
  'Just Trying It Out': {
    emoji: '🪄',
    headline: 'fair enough.',
    body: 'one trip is all it takes to see the difference. we’ll show you what’s possible.',
  },
};

export function buildCommitmentResponse(a: Answers): CommitmentResponse {
  const res =
    (a.commitment && COMMITMENT_RESPONSES[a.commitment]) ||
    COMMITMENT_RESPONSES['Somewhat Committed'];
  return {
    ...res,
    headline: interpolate(res.headline, a),
    body: interpolate(res.body, a),
  };
}

/* ------------------------------------------------------------------ */
/* Screen 29 — target date                                             */
/* ------------------------------------------------------------------ */

export function targetDateLabel(): string {
  return format(addDays(new Date(), 30), 'MMMM d');
}
