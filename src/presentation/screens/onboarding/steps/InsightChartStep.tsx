import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import {
  OnboardingShell,
  OnboardingButton,
  AccentText,
  InsightLineChart,
  useEntrance,
  onboardingTokens,
  f,
  ms,
} from '@/presentation/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { interpolate } from '@/config/onboarding/personalization';
import type { InsightChartStepDef, StepRendererProps } from '@/config/onboarding/types';

type Props = StepRendererProps<InsightChartStepDef>;

export function InsightChartStep({ step, onNext, index, total }: Props) {
  const store = useOnboardingStore();
  const titleAnim = useEntrance(100);
  const chartAnim = useEntrance(260);
  const captionAnim = useEntrance(520);

  return (
    <OnboardingShell
      scroll
      footer={<OnboardingButton title={`${step.cta} →`} onPress={onNext} />}
      progress={{ index, total, visible: step.showProgress !== false }}
      contentStyle={styles.content}
    >
      <Animated.View style={titleAnim}>
        <AccentText style={styles.headline}>
          {interpolate(step.headline, store)}
        </AccentText>
      </Animated.View>

      <Animated.View style={[chartAnim, { marginTop: ms(22) }]}>
        <InsightLineChart />
      </Animated.View>

      <Animated.View style={[captionAnim, { marginTop: ms(20) }]}>
        <Typography
          variant="title3"
          weight="semiBold"
          color={onboardingTokens.textPrimary}
          align="center"
          style={{ fontSize: f(17) }}
        >
          {interpolate(step.caption, store)}
        </Typography>
      </Animated.View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  headline: {
    fontSize: f(24),
    lineHeight: f(31),
    fontWeight: '800',
    color: onboardingTokens.textPrimary,
    textAlign: 'center',
  },
});
