import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import {
  OnboardingShell,
  OnboardingButton,
  useEntrance,
  onboardingTokens,
  f,
  ms,
} from '@/presentation/components/onboarding';
import { radii } from '@/theme/radii';
import { useTheme } from '@/theme/ThemeContext';
import type { StepRendererProps, TrialIntroStepDef } from '@/config/onboarding/types';

type Props = StepRendererProps<TrialIntroStepDef>;

/**
 * Onboarding pitch screen — surfaces what the user gets with TripNode Premium.
 * The CTA simply advances onboarding; the real paywall and purchase run after
 * signup. Mirrors the layout of the reference but in the dark onboarding theme.
 */
export function TrialIntroStep({ step, onNext, index, total }: Props) {
  const { colors } = useTheme();
  const headAnim = useEntrance(120);
  const listAnim = useEntrance(320);
  const footAnim = useEntrance(520);

  return (
    <OnboardingShell
      footer={
        <Animated.View style={footAnim}>
          <View style={styles.reassureRow}>
            <View style={[styles.check, { backgroundColor: colors.electricBlue }]}>
              <Ionicons name="checkmark" size={ms(12)} color="#FFFFFF" />
            </View>
            <Typography
              variant="footnote"
              weight="semiBold"
              color={onboardingTokens.textPrimary}
              style={{ fontSize: f(13) }}
            >
              {step.reassurance}
            </Typography>
          </View>
          <OnboardingButton title={step.cta} onPress={onNext} />
        </Animated.View>
      }
      progress={{ index, total, visible: step.showProgress !== false }}
      scroll
    >
      <Animated.View style={headAnim}>
        <Typography
          variant="title1"
          weight="bold"
          color={onboardingTokens.textPrimary}
          align="center"
          style={{ fontSize: f(26), lineHeight: f(33) }}
        >
          {step.headline}
        </Typography>
        {step.subheading ? (
          <Typography
            variant="subheadline"
            color={onboardingTokens.textSecondary}
            align="center"
            style={{ fontSize: f(14), marginTop: ms(8), lineHeight: f(20) }}
          >
            {step.subheading}
          </Typography>
        ) : null}
      </Animated.View>

      <Animated.View style={[listAnim, styles.list]}>
        {step.features.map((feature) => (
          <View key={feature.title} style={styles.row}>
            <View style={styles.iconTile}>
              <Ionicons
                name={feature.icon as keyof typeof Ionicons.glyphMap}
                size={ms(20)}
                color={onboardingTokens.accent}
              />
            </View>
            <View style={styles.rowText}>
              <Typography
                variant="callout"
                weight="bold"
                color={onboardingTokens.textPrimary}
                style={{ fontSize: f(15), lineHeight: f(20) }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="footnote"
                color={onboardingTokens.textSecondary}
                style={{ fontSize: f(12.5), marginTop: ms(2), lineHeight: f(17) }}
              >
                {feature.subtitle}
              </Typography>
            </View>
          </View>
        ))}
      </Animated.View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: ms(28),
    gap: ms(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: onboardingTokens.cardBg,
    borderColor: onboardingTokens.cardBorder,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: ms(14),
    gap: ms(14),
  },
  iconTile: {
    width: ms(44),
    height: ms(44),
    borderRadius: radii.md,
    backgroundColor: onboardingTokens.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  reassureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: ms(8),
    marginBottom: ms(16),
  },
  check: {
    width: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
