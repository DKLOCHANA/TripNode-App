/**
 * Centralized onboarding configuration
 * Single source of truth for all onboarding questions and analytics screens
 */

// Question screen configurations
export const ONBOARDING_QUESTIONS = {
  question1: {
    question: 'What stresses you the most when planning a trip?',
    options: [
      'Planning takes too long',
      'I miss important places',
      'Hard to manage daily schedule',
      'Too many decisions to make',
    ] as const,
    nextRoute: '/(auth)/onboarding/analytics1' as const,
    storeKey: 'selectedAnswer1' as const,
  },
  question2: {
    question: 'What usually wastes your travel time the most?',
    options: [
      'Poor route planning',
      'Waiting in wrong locations',
      'Visiting crowded places',
      'Switching between travel apps',
    ] as const,
    nextRoute: '/(auth)/onboarding/analytics2' as const,
    storeKey: 'selectedAnswer2' as const,
  },
  question3: {
    question: 'What is hardest about managing your travel budget?',
    options: [
      'Estimating total trip cost',
      'Overspending unexpectedly',
      'Choosing affordable activities',
      'Balancing comfort vs price',
    ] as const,
    nextRoute: '/(auth)/onboarding/analytics3' as const,
    storeKey: 'selectedAnswer3' as const,
  },
} as const;

// Analytics screen configurations
export const ONBOARDING_ANALYTICS = {
  analytics1: {
    title: 'TripNode removes 90% of planning effort',
    subtitles: {
      'Planning takes too long': 'Users save up to 6 hours per trip',
      'I miss important places': 'TripNode detects top attractions automatically',
      'Hard to manage daily schedule': 'Smart day-by-day planning included',
      'Too many decisions to make': 'TripNode simplifies every travel choice instantly',
    } as Record<string, string>,
    defaultSubtitle: 'Users save up to 6 hours per trip',
    supportingText: 'TripNode automatically organizes destinations, routes, and daily schedules in seconds using AI trip intelligence.',
    chartType: 'efficiency' as const,
    chartProps: {
      withoutValue: 12,
      withValue: 94,
      withoutLabel: 'Without TripNode',
      withLabel: 'With TripNode',
    },
    nextRoute: '/(auth)/onboarding/question2' as const,
    storeKey: 'selectedAnswer1' as const,
  },
  analytics2: {
    title: 'Travel smarter with AI route optimization',
    subtitles: {
      'Poor route planning': 'Smart location clustering saves travel hours',
      'Waiting in wrong locations': 'Accurate timing suggestions reduce waiting',
      'Visiting crowded places': 'TripNode prioritizes better time windows',
      'Switching between travel apps': 'Everything planned inside one app',
    } as Record<string, string>,
    defaultSubtitle: 'Smart location clustering saves travel hours',
    supportingText: 'TripNode clusters locations intelligently so every destination fits perfectly into your day.',
    chartType: 'timeline' as const,
    chartProps: {
      withoutTime: '2h 40m',
      withTime: '12m',
      withoutLabel: 'Daily time wasted without TripNode',
      withLabel: 'Daily time wasted with TripNode',
    },
    nextRoute: '/(auth)/onboarding/question3' as const,
    storeKey: 'selectedAnswer2' as const,
  },
  analytics3: {
    title: 'Plan trips with budget confidence',
    subtitles: {
      'Estimating total trip cost': 'TripNode estimates full itinerary expenses',
      'Overspending unexpectedly': 'Daily spending stays controlled automatically',
      'Choosing affordable activities': 'Smart activity selection within your budget',
      'Balancing comfort vs price': 'AI optimizes value vs experience quality',
    } as Record<string, string>,
    defaultSubtitle: 'TripNode estimates full itinerary expenses',
    supportingText: 'TripNode balances activities and time based on your travel budget automatically.',
    chartType: 'percentage' as const,
    chartProps: {
      withoutValue: 22,
      withValue: 91,
      withoutLabel: 'Budget uncertainty without TripNode',
      withLabel: 'Budget clarity',
    },
    nextRoute: '/(auth)/onboarding/final' as const,
    storeKey: 'selectedAnswer3' as const,
  },
} as const;

// Type exports derived from config
export type Question1Option = typeof ONBOARDING_QUESTIONS.question1.options[number];
export type Question2Option = typeof ONBOARDING_QUESTIONS.question2.options[number];
export type Question3Option = typeof ONBOARDING_QUESTIONS.question3.options[number];
export type QuestionOption = Question1Option | Question2Option | Question3Option;

export type QuestionKey = keyof typeof ONBOARDING_QUESTIONS;
export type AnalyticsKey = keyof typeof ONBOARDING_ANALYTICS;
