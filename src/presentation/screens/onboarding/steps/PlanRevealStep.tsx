import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import {
  OnboardingShell,
  OnboardingButton,
  AccentText,
  useEntrance,
  onboardingTokens,
  f,
  ms,
} from '@/presentation/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { displayName, targetDateLabel } from '@/config/onboarding/personalization';
import type { PlanRevealStepDef, StepRendererProps } from '@/config/onboarding/types';

const PILLARS = [
  { emoji: '🗺️', label: 'every day\nscheduled' },
  { emoji: '💰', label: 'budget\nbuilt in' },
  { emoji: '⏱️', label: 'zero\nwasted hrs' },
];

const FEATURES = [
  { emoji: '🗺️', title: 'AI Itinerary', desc: 'full plan from a single prompt' },
  { emoji: '🏛️', title: 'Smart Attractions', desc: 'matched to your interests' },
  { emoji: '📍', title: 'Maps', desc: 'tap any stop to navigate' },
  { emoji: '📋', title: 'My Trips', desc: 'saved and shareable' },
];

type Props = StepRendererProps<PlanRevealStepDef>;

export function PlanRevealStep({ step, onNext, index, total }: Props) {
  const { userName } = useOnboardingStore();
  const titleAnim = useEntrance(100);
  const pillarsAnim = useEntrance(260);
  const featuresAnim = useEntrance(420);

  return (
    <OnboardingShell
      scroll
      footer={<OnboardingButton title={step.cta} onPress={onNext} />}
      progress={{ index, total, visible: step.showProgress !== false }}
      contentStyle={styles.content}
    >
      <Animated.View style={titleAnim}>
        <AccentText style={styles.headline}>
          {`${displayName(userName)}, by *${targetDateLabel()}* you could have your next trip ready to go.`}
        </AccentText>
      </Animated.View>

      <Animated.View style={[pillarsAnim, styles.pillars]}>
        {PILLARS.map((p) => (
          <View key={p.label} style={styles.pillar}>
            <Typography variant="title3" style={{ fontSize: f(20) }}>
              {p.emoji}
            </Typography>
            <Typography
              variant="caption2"
              weight="bold"
              color={onboardingTokens.textPrimary}
              align="center"
              style={{ fontSize: f(10), marginTop: ms(4), lineHeight: f(13) }}
            >
              {p.label}
            </Typography>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[featuresAnim, { marginTop: ms(22) }]}>
        <Typography
          variant="footnote"
          weight="bold"
          color={onboardingTokens.textPrimary}
          style={{ fontSize: f(13), marginBottom: ms(10) }}
        >
          how we’ll get you there:
        </Typography>
        {FEATURES.map((feat) => (
          <View key={feat.title} style={styles.featureRow}>
            <Typography variant="footnote" style={{ fontSize: f(16) }}>
              {feat.emoji}
            </Typography>
            <Typography
              variant="footnote"
              color={onboardingTokens.textSecondary}
              style={{ fontSize: f(13), flex: 1, lineHeight: f(19) }}
            >
              <Typography
                variant="footnote"
                weight="bold"
                color={onboardingTokens.textPrimary}
                style={{ fontSize: f(13) }}
              >
                {feat.title}
              </Typography>
              {`  —  ${feat.desc}`}
            </Typography>
          </View>
        ))}
      </Animated.View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  headline: {
    fontSize: f(21),
    lineHeight: f(28),
    fontWeight: '800',
    color: onboardingTokens.textPrimary,
  },
  pillars: {
    flexDirection: 'row',
    gap: ms(8),
    marginTop: ms(20),
  },
  pillar: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: onboardingTokens.cardBgSelected,
    borderRadius: ms(12),
    paddingVertical: ms(12),
    paddingHorizontal: ms(4),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    marginTop: ms(9),
  },
});
