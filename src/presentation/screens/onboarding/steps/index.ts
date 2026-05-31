import type { OnboardingStep, StepRendererProps } from '@/config/onboarding/types';
import { StatementStep } from './StatementStep';
import { TextInputStep } from './TextInputStep';
import { ChoiceStep } from './ChoiceStep';
import { ReflectionStep } from './ReflectionStep';
import { InsightChartStep } from './InsightChartStep';
import { HowItWorksStep } from './HowItWorksStep';
import { LoadingStep } from './LoadingStep';
import { ItineraryStep } from './ItineraryStep';
import { CongratsStep } from './CongratsStep';
import { StreakStep } from './StreakStep';
import { PlanReadyStep } from './PlanReadyStep';
import { SnapshotStep } from './SnapshotStep';
import { PlanRevealStep } from './PlanRevealStep';
import { SocialProofStep } from './SocialProofStep';
import { TrialIntroStep } from './TrialIntroStep';
import { PermissionsStep } from './PermissionsStep';

type AnyStepComponent = (props: StepRendererProps<any>) => React.JSX.Element;

/** Maps a step `type` to its renderer. */
export const STEP_REGISTRY: Record<OnboardingStep['type'], AnyStepComponent> = {
  statement: StatementStep,
  dynamicStatement: StatementStep,
  textInput: TextInputStep,
  choice: ChoiceStep,
  reflection: ReflectionStep,
  insightChart: InsightChartStep,
  howItWorks: HowItWorksStep,
  loading: LoadingStep,
  itinerary: ItineraryStep,
  congrats: CongratsStep,
  streak: StreakStep,
  planReady: PlanReadyStep,
  snapshot: SnapshotStep,
  planReveal: PlanRevealStep,
  socialProof: SocialProofStep,
  trialIntro: TrialIntroStep,
  permissions: PermissionsStep,
};
