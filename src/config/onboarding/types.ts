/**
 * Onboarding flow type system.
 *
 * The flow is a single ordered list of typed "steps". The flow controller walks
 * the list; a renderer is picked per `type`. Static copy lives in the step
 * descriptor — anything personalised (name, destination, derived tokens) is
 * resolved at render time from the onboarding store via `personalization.ts`.
 */

import type { YesNo } from '@/store/onboardingStore';

/** Which store field a question writes to. */
export type AnswerField =
  | 'planHabit'
  | 'tripProblem'
  | 'budgetStyle'
  | 'commitment';

export interface ChoiceOptionDef {
  /** Stored value (the canonical phrase used by personalization). */
  value: string;
  /** Short label shown on the pill/chip. */
  label: string;
  emoji?: string;
}

interface BaseStep {
  /** Stable id — also used as the React key and analytics screen name. */
  id: string;
  /** Human screen number from the spec (for traceability). */
  screen: number;
  /** Show the slim progress bar on this step. Default true. */
  showProgress?: boolean;
}

/** Plain narrative screen: headline + optional body, advance by tap / button / timer. */
export interface StatementStepDef extends BaseStep {
  type: 'statement';
  /** Headline. `{name}` is interpolated. A word wrapped in *asterisks* is accented. */
  headline: string;
  subheading?: string;
  /** Body paragraphs — each renders as a block; `{name}` interpolated. */
  body?: string[];
  emoji?: string;
  /** How the user moves on. */
  advance: 'tap' | 'button' | 'auto';
  /** For `auto` — ms before auto-advancing (tap also works). */
  autoMs?: number;
  /** CTA label for `button`. */
  cta?: string;
  /** Center the content vertically (default true for statements). */
  centered?: boolean;
}

/** Dynamic statement whose copy is chosen from the user's commitment answer (screen 28). */
export interface DynamicStatementStepDef extends BaseStep {
  type: 'dynamicStatement';
  /** Reads `commitment` from the store and returns headline/body/emoji. */
  source: 'commitment';
  cta: string;
}

export interface TextInputStepDef extends BaseStep {
  type: 'textInput';
  headline: string;
  subheading?: string;
  placeholder: string;
  field: 'userName' | 'destination';
  minChars: number;
  cta: string;
  /** Keyboard auto-capitalisation. */
  autoCapitalize?: 'none' | 'words' | 'sentences';
}

export interface ChoiceStepDef extends BaseStep {
  type: 'choice';
  headline: string;
  subheading?: string;
  mode: 'single' | 'multi';
  /** For multi — max selectable. */
  maxSelect?: number;
  /** Visual style: stacked rows or wrapping chips. */
  layout: 'list' | 'chips';
  options: ChoiceOptionDef[];
  /** Store field for single-select. */
  field?: AnswerField;
  /** Store field for the yes/no screen. */
  yesNoField?: 'missedBest';
  /** Store field for multi-select. */
  multiField?: 'priorities';
  cta: string;
}

/** Personalised mirror screens (12, 15, 16) — content built in personalization.ts. */
export interface ReflectionStepDef extends BaseStep {
  type: 'reflection';
  variant: 'goals' | 'emotional' | 'insightCards';
  cta: string;
}

export interface InsightChartStepDef extends BaseStep {
  type: 'insightChart';
  headline: string;
  caption: string;
  cta: string;
}

export interface HowItWorksStepDef extends BaseStep {
  type: 'howItWorks';
  title: string;
  steps: string[];
  footer: string;
  cta: string;
}

export interface LoadingStepDef extends BaseStep {
  type: 'loading';
  /** Subheading — `{destination}` / `{name}` interpolated. */
  caption?: string;
  steps: string[];
  /** Minimum visible duration in ms. */
  durationMs: number;
  tint: 'blue' | 'dark';
  /**
   * Background work to run while loading. `previewItinerary` calls the AI to
   * generate the Day-1 preview and advances only once it resolves (after the
   * minimum duration). Omitted = purely cosmetic timed loader.
   */
  task?: 'previewItinerary';
}

export interface ItineraryStepDef extends BaseStep {
  type: 'itinerary';
  cta: string;
}

export interface CongratsStepDef extends BaseStep {
  type: 'congrats';
  cta: string;
}

export interface StreakStepDef extends BaseStep {
  type: 'streak';
  cta: string;
}

export interface PlanReadyStepDef extends BaseStep {
  type: 'planReady';
  cta: string;
}

export interface SnapshotStepDef extends BaseStep {
  type: 'snapshot';
  cta: string;
}

export interface PlanRevealStepDef extends BaseStep {
  type: 'planReveal';
  cta: string;
}

export interface SocialProofStepDef extends BaseStep {
  type: 'socialProof';
  cta: string;
}

export interface PermissionsStepDef extends BaseStep {
  type: 'permissions';
  cta: string;
}

/**
 * Trial-style premium intro shown immediately before the permissions step.
 * The CTA simply advances onboarding — the real RevenueCat paywall runs
 * post-signup. Copy intentionally avoids "Try for $0" wording since the
 * App Store products don't have an introductory offer configured.
 */
export interface TrialIntroStepDef extends BaseStep {
  type: 'trialIntro';
  headline: string;
  subheading?: string;
  features: { icon: string; title: string; subtitle: string }[];
  /** Caption rendered next to the small check below the feature list. */
  reassurance: string;
  cta: string;
}

export type OnboardingStep =
  | StatementStepDef
  | DynamicStatementStepDef
  | TextInputStepDef
  | ChoiceStepDef
  | ReflectionStepDef
  | InsightChartStepDef
  | HowItWorksStepDef
  | LoadingStepDef
  | ItineraryStepDef
  | CongratsStepDef
  | StreakStepDef
  | PlanReadyStepDef
  | SnapshotStepDef
  | PlanRevealStepDef
  | SocialProofStepDef
  | TrialIntroStepDef
  | PermissionsStepDef;

/** Props every step renderer receives from the flow controller. */
export interface StepRendererProps<T extends OnboardingStep = OnboardingStep> {
  step: T;
  /** Advance to the next step. */
  onNext: () => void;
  /** Finish the whole flow (persist completion, go to Register). */
  onComplete: () => void;
  /** 0-based index of this step. */
  index: number;
  /** Total number of steps. */
  total: number;
}

export type { YesNo };
