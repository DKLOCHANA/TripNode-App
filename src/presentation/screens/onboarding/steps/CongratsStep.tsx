import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Easing } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import {
  OnboardingShell,
  OnboardingButton,
  useEntrance,
  onboardingTokens,
  f,
  ms,
} from '@/presentation/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { displayDestination } from '@/config/onboarding/personalization';
import type { CongratsStepDef, StepRendererProps } from '@/config/onboarding/types';

type Props = StepRendererProps<CongratsStepDef>;

export function CongratsStep({ step, onNext, index, total }: Props) {
  const { destination } = useOnboardingStore();
  const headAnim = useEntrance(120);
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        delay: 360,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        delay: 360,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <OnboardingShell
      footer={<OnboardingButton title={step.cta} onPress={onNext} />}
      progress={{ index, total, visible: step.showProgress !== false }}
      centered
    >
      <View style={styles.center}>
        <Animated.View style={headAnim}>
          <Animated.Text style={styles.icon}>✈️</Animated.Text>
          <Typography
            variant="title1"
            weight="heavy"
            color={onboardingTokens.accent}
            align="center"
            style={{ fontSize: f(26) }}
          >
            congratulations!
          </Typography>
          <Typography
            variant="subheadline"
            color={onboardingTokens.textSecondary}
            align="center"
            style={{ fontSize: f(13), marginTop: ms(6) }}
          >
            you just planned your first trip with TripNode.
          </Typography>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: cardOpacity, transform: [{ scale: cardScale }] },
          ]}
        >
          <Typography
            variant="footnote"
            weight="heavy"
            color={onboardingTokens.textPrimary}
            style={{ fontSize: f(14) }}
          >
            🗾 {displayDestination(destination)}
          </Typography>
          <Typography
            variant="caption1"
            color={onboardingTokens.textSecondary}
            style={{ fontSize: f(11), marginTop: ms(4), lineHeight: f(16) }}
          >
            Day 1 of 3 · Senso-ji, Tsukiji, Shibuya…{'\n'}💰 est. $90/day
          </Typography>
        </Animated.View>

        <Animated.View style={headAnim}>
          <Typography
            variant="footnote"
            color={onboardingTokens.textSecondary}
            align="center"
            style={{ fontSize: f(12), marginTop: ms(16) }}
          >
            saved in{' '}
            <Typography
              variant="footnote"
              weight="bold"
              color={onboardingTokens.textPrimary}
              style={{ fontSize: f(12) }}
            >
              My Trips
            </Typography>{' '}
            — open, share, or tweak anytime.
          </Typography>
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  icon: {
    fontSize: f(40),
    textAlign: 'center',
    marginBottom: ms(8),
  },
  card: {
    width: '100%',
    backgroundColor: onboardingTokens.cardBg,
    borderColor: onboardingTokens.cardBorder,
    borderWidth: 1,
    borderRadius: ms(14),
    padding: ms(14),
    marginTop: ms(22),
  },
});
