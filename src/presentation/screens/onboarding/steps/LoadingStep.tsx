import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import {
  OnboardingShell,
  LoadingRing,
  onboardingTokens,
  f,
  ms,
} from '@/presentation/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { interpolate } from '@/config/onboarding/personalization';
import { generatePreviewDayResilient } from '@/data/sources/remote/api/onboardingPreviewApi';
import type { LoadingStepDef, StepRendererProps } from '@/config/onboarding/types';

type Props = StepRendererProps<LoadingStepDef>;

export function LoadingStep({ step, onNext, index, total }: Props) {
  const store = useOnboardingStore();
  const isTask = step.task === 'previewItinerary';

  // For the preview-itinerary loader we advance only once BOTH the minimum
  // ring duration has elapsed AND the AI call has resolved (success or
  // fallback). Cosmetic loaders just advance when the ring completes.
  const [minElapsed, setMinElapsed] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const advanced = useRef(false);

  useEffect(() => {
    if (!isTask) return;
    let active = true;
    const { destination, priorities, budgetStyle, setPreviewDay } =
      useOnboardingStore.getState();

    generatePreviewDayResilient({
      destination,
      interests: priorities,
      budgetStyle,
    }).then((day) => {
      if (!active) return;
      setPreviewDay(day);
      setAiDone(true);
    });

    return () => {
      active = false;
    };
  }, [isTask]);

  useEffect(() => {
    if (!isTask) return;
    if (minElapsed && aiDone && !advanced.current) {
      advanced.current = true;
      onNext();
    }
  }, [isTask, minElapsed, aiDone, onNext]);

  const handleRingDone = () => {
    if (isTask) {
      setMinElapsed(true);
      return;
    }
    if (!advanced.current) {
      advanced.current = true;
      onNext();
    }
  };

  return (
    <OnboardingShell
      progress={{ index, total, visible: step.showProgress !== false }}
      centered
    >
      <View style={styles.center}>
        {step.caption ? (
          <Typography
            variant="title3"
            weight="semiBold"
            color={onboardingTokens.textPrimary}
            align="center"
            style={{ fontSize: f(17), marginBottom: ms(26) }}
          >
            {interpolate(step.caption, store)}
          </Typography>
        ) : null}

        <LoadingRing
          steps={step.steps}
          durationMs={step.durationMs}
          tint={step.tint}
          onDone={handleRingDone}
        />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
});
