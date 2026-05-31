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
import { displayName } from '@/config/onboarding/personalization';
import type { SocialProofStepDef, StepRendererProps } from '@/config/onboarding/types';

const REVIEWS = [
  {
    title: 'BEST TRIP I’VE EVER TAKEN.',
    body:
      'I used to spend entire weekends researching. TripNode gave me a 5-day Tokyo plan in 2 minutes that was better than anything I’d found in hours. I saw MORE and spent less.',
  },
  {
    title: 'WHY DIDN’T THIS EXIST SOONER.',
    body:
      'Planned a Bali trip for me and my girlfriend. Every spot was walking distance from the last. Budget was spot on. We didn’t miss a thing.',
  },
];

type Props = StepRendererProps<SocialProofStepDef>;

export function SocialProofStep({ step, onNext, index, total }: Props) {
  const { userName } = useOnboardingStore();
  const titleAnim = useEntrance(100);
  const badgeAnim = useEntrance(240);

  return (
    <OnboardingShell
      scroll
      footer={<OnboardingButton title={step.cta} onPress={onNext} />}
      progress={{ index, total, visible: step.showProgress !== false }}
      contentStyle={styles.content}
    >
      <Animated.View style={titleAnim}>
        <AccentText style={styles.headline}>
          {`TripNode was built for travelers like you, *${displayName(userName)}*.`}
        </AccentText>
        <Typography
          variant="subheadline"
          color={onboardingTokens.textSecondary}
          style={{ fontSize: f(13), marginTop: ms(6) }}
        >
          reviews from real travelers using TripNode.
        </Typography>
      </Animated.View>

      <Animated.View style={[badgeAnim, styles.badge]}>
        <Typography
          variant="footnote"
          weight="heavy"
          color={onboardingTokens.textPrimary}
          align="center"
          style={{ fontSize: f(13) }}
        >
          🏆 the smartest way to plan a trip
        </Typography>
        <Typography
          variant="footnote"
          color={onboardingTokens.warning}
          align="center"
          style={{ fontSize: f(14), marginTop: ms(3) }}
        >
          ★★★★★
        </Typography>
        <Typography
          variant="caption1"
          color={onboardingTokens.textTertiary}
          align="center"
          style={{ fontSize: f(11), marginTop: ms(2) }}
        >
          ✈️ + 25,000 trips planned
        </Typography>
      </Animated.View>

      {REVIEWS.map((r, i) => (
        <ReviewCard
          key={r.title}
          delay={400 + i * 150}
          title={r.title}
          body={r.body}
        />
      ))}
    </OnboardingShell>
  );
}

function ReviewCard({
  delay,
  title,
  body,
}: {
  delay: number;
  title: string;
  body: string;
}) {
  const anim = useEntrance(delay);
  return (
    <Animated.View style={[anim, styles.review]}>
      <Typography
        variant="caption1"
        color={onboardingTokens.warning}
        style={{ fontSize: f(11) }}
      >
        ★★★★★
      </Typography>
      <Typography
        variant="footnote"
        weight="heavy"
        color={onboardingTokens.textPrimary}
        style={{ fontSize: f(12), marginTop: ms(2) }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption1"
        color={onboardingTokens.textSecondary}
        style={{ fontSize: f(11.5), marginTop: ms(3), lineHeight: f(16) }}
      >
        “{body}”
      </Typography>
    </Animated.View>
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
  badge: {
    backgroundColor: onboardingTokens.cardBg,
    borderColor: onboardingTokens.cardBorder,
    borderWidth: 1,
    borderRadius: ms(14),
    padding: ms(14),
    marginTop: ms(18),
  },
  review: {
    backgroundColor: onboardingTokens.cardBg,
    borderColor: onboardingTokens.cardBorder,
    borderLeftColor: onboardingTokens.accent,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: ms(13),
    padding: ms(13),
    marginTop: ms(10),
  },
});
