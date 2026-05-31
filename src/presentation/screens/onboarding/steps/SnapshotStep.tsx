import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import {
  OnboardingShell,
  OnboardingButton,
  TravelDnaBar,
  useEntrance,
  onboardingTokens,
  f,
  ms,
} from '@/presentation/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { buildSnapshot } from '@/config/onboarding/personalization';
import type { SnapshotStepDef, StepRendererProps } from '@/config/onboarding/types';

type Props = StepRendererProps<SnapshotStepDef>;

export function SnapshotStep({ step, onNext, index, total }: Props) {
  const answers = useOnboardingStore();
  const data = buildSnapshot(answers);
  const titleAnim = useEntrance(100);

  return (
    <OnboardingShell
      scroll
      footer={<OnboardingButton title={step.cta} onPress={onNext} />}
      progress={{ index, total, visible: step.showProgress !== false }}
      contentStyle={styles.content}
    >
      <Animated.View style={titleAnim}>
        <Typography
          variant="title2"
          weight="bold"
          color={onboardingTokens.textPrimary}
          style={{ fontSize: f(22) }}
        >
          {data.title}
        </Typography>
        <Typography
          variant="subheadline"
          color={onboardingTokens.textSecondary}
          style={{ fontSize: f(13), marginTop: ms(4) }}
        >
          based on your answers, here’s your travel DNA:
        </Typography>
      </Animated.View>

      <SnapCard delay={220} label="🧭 Travel style">
        <TravelDnaBar
          pct={data.travelStylePct}
          leftLabel="tourist"
          rightLabel="explorer"
        />
      </SnapCard>

      <SnapCard delay={340} label="💰 Budget instinct">
        <Typography
          variant="footnote"
          weight="bold"
          color={onboardingTokens.accent}
          style={{ fontSize: f(13), marginTop: ms(4) }}
        >
          {data.budgetInstinct}
        </Typography>
      </SnapCard>

      <SnapCard delay={460} label="⚡ Planning confidence">
        <TravelDnaBar
          pct={data.planningConfidencePct}
          leftLabel="low"
          rightLabel="high"
          tone="warning"
          caption="room to grow"
        />
      </SnapCard>

      <SnapCard delay={580} label="💪 Strengths">
        {data.strengths.map((s) => (
          <Typography
            key={s}
            variant="caption1"
            color={onboardingTokens.textSecondary}
            style={{ fontSize: f(12), marginTop: ms(3), lineHeight: f(17) }}
          >
            •  {s}
          </Typography>
        ))}
      </SnapCard>
    </OnboardingShell>
  );
}

function SnapCard({
  delay,
  label,
  children,
}: {
  delay: number;
  label: string;
  children: React.ReactNode;
}) {
  const anim = useEntrance(delay);
  return (
    <Animated.View style={[anim, styles.card]}>
      <Typography
        variant="footnote"
        weight="heavy"
        color={onboardingTokens.textPrimary}
        style={{ fontSize: f(12), marginBottom: ms(6) }}
      >
        {label}
      </Typography>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  card: {
    backgroundColor: onboardingTokens.cardBg,
    borderColor: onboardingTokens.cardBorder,
    borderWidth: 1,
    borderRadius: ms(14),
    padding: ms(14),
    marginTop: ms(12),
  },
});
