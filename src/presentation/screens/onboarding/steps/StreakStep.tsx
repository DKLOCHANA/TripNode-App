import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import {
  OnboardingShell,
  OnboardingButton,
  useEntrance,
  onboardingTokens,
  f,
  ms,
} from '@/presentation/components/onboarding';
import { useTheme } from '@/theme/ThemeContext';
import type { StreakStepDef, StepRendererProps } from '@/config/onboarding/types';

const TRACKER = [1, 2, 3, 4, 5];

type Props = StepRendererProps<StreakStepDef>;

/** Screen 23 — emotional peak. Streak tracker that sets up the weekly habit loop. */
export function StreakStep({ step, onNext, index, total }: Props) {
  const { colors } = useTheme();
  const headAnim = useEntrance(120);
  const trackerAnim = useEntrance(320);

  return (
    <OnboardingShell
      footer={<OnboardingButton title={step.cta} onPress={onNext} />}
      progress={{ index, total, visible: step.showProgress !== false }}
      centered
    >
      <View style={styles.center}>
        <Animated.View style={[headAnim, styles.center]}>
          <Animated.Text style={styles.icon}>✈️</Animated.Text>
          <Typography
            variant="title2"
            weight="bold"
            color={onboardingTokens.textPrimary}
            align="center"
            style={{ fontSize: f(22) }}
          >
            your travel streak begins.
          </Typography>
        </Animated.View>

        <Animated.View style={[trackerAnim, styles.tracker]}>
          {TRACKER.map((n) => {
            const active = n === 1;
            return (
              <View
                key={n}
                style={[
                  styles.node,
                  {
                    backgroundColor: active
                      ? colors.electricBlue
                      : onboardingTokens.cardBg,
                    borderColor: active
                      ? colors.electricBlue
                      : onboardingTokens.cardBorder,
                  },
                ]}
              >
                <Typography
                  variant="footnote"
                  weight="heavy"
                  color={active ? '#FFFFFF' : onboardingTokens.textTertiary}
                  style={{ fontSize: f(14) }}
                >
                  {n}
                </Typography>
              </View>
            );
          })}
        </Animated.View>

        <Animated.View style={trackerAnim}>
          <Typography
            variant="footnote"
            color={onboardingTokens.textSecondary}
            align="center"
            style={{ fontSize: f(13), marginTop: ms(20), lineHeight: f(20) }}
          >
            plan a trip each week to keep your streak alive and unlock curated
            destination collections.
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
    fontSize: f(46),
    textAlign: 'center',
    marginBottom: ms(10),
  },
  tracker: {
    flexDirection: 'row',
    gap: ms(10),
    marginTop: ms(22),
  },
  node: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(19),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
