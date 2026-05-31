import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
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
import { requestPermission } from '@/services/notificationService';
import { useNotificationStore } from '@/store/notificationStore';
import type { PermissionsStepDef, StepRendererProps } from '@/config/onboarding/types';

type Props = StepRendererProps<PermissionsStepDef>;

/**
 * Final onboarding step — the App Store-compliant explanation shown before the
 * native permission prompt. The "Enable reminders" CTA triggers the OS dialog;
 * if granted, we flip the notification preference so trip reminders schedule
 * once the user has saved trips. Either outcome proceeds to finish onboarding.
 *
 * Layout mirrors the two-card "with / without" pattern from the design ref.
 */
export function PermissionsStep({ step, onComplete, index, total }: Props) {
  const { colors } = useTheme();
  const iconAnim = useEntrance(80);
  const headAnim = useEntrance(220);
  const cardsAnim = useEntrance(380);
  const footAnim = useEntrance(560);

  const setEnabled = useNotificationStore((s) => s.setEnabled);
  const busy = useRef(false);

  const handleAllow = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const granted = await requestPermission();
      if (granted) await setEnabled(true);
    } finally {
      onComplete();
    }
  }, [setEnabled, onComplete]);

  // Skip without asking — the user can still turn reminders on from Profile.
  const handleSkip = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    onComplete();
  }, [onComplete]);

  return (
    <OnboardingShell
      footer={
        <Animated.View style={footAnim}>
          <OnboardingButton title={step.cta} onPress={handleAllow} />
          <Pressable
            onPress={handleSkip}
            hitSlop={10}
            style={styles.skip}
            accessibilityRole="button"
          >
            <Typography
              variant="footnote"
              weight="semiBold"
              color={onboardingTokens.textSecondary}
              style={{ fontSize: f(13), textDecorationLine: 'underline' }}
            >
              Skip — I'll risk missing the reminder
            </Typography>
          </Pressable>
        </Animated.View>
      }
      progress={{ index, total, visible: step.showProgress !== false }}
      centered
    >
      <Animated.View style={[iconAnim, styles.iconWrap]}>
        <View style={styles.bellCircle}>
          <Ionicons
            name="notifications-outline"
            size={ms(36)}
            color={onboardingTokens.accent}
          />
        </View>
      </Animated.View>

      <Animated.View style={headAnim}>
        <Typography
          variant="title1"
          weight="bold"
          color={onboardingTokens.textPrimary}
          align="center"
          style={{ fontSize: f(24), lineHeight: f(31) }}
        >
          We'll remind you{'\n'}before your trial ends.
        </Typography>
        <Typography
          variant="subheadline"
          color={onboardingTokens.textSecondary}
          align="center"
          style={{ fontSize: f(14), lineHeight: f(20), marginTop: ms(12) }}
        >
          No surprise charges. Turn on notifications and we'll ping you 24
          hours before your free trial converts — so you decide.
        </Typography>
      </Animated.View>

      <Animated.View style={[cardsAnim, styles.cardGroup]}>
        <View style={styles.card}>
          <View style={[styles.iconTile, styles.iconTilePositive]}>
            <Ionicons
              name="notifications"
              size={ms(18)}
              color={onboardingTokens.accent}
            />
          </View>
          <View style={styles.cardText}>
            <Typography
              variant="callout"
              weight="bold"
              color={onboardingTokens.textPrimary}
              style={{ fontSize: f(14.5), lineHeight: f(20) }}
            >
              Trial-ending reminder
            </Typography>
            <Typography
              variant="footnote"
              color={onboardingTokens.textSecondary}
              style={{ fontSize: f(12), marginTop: ms(2), lineHeight: f(17) }}
            >
              A heads-up the day before billing starts. Cancel in one tap if
              it's not for you.
            </Typography>
          </View>
        </View>

        <View style={styles.card}>
          <View
            style={[
              styles.iconTile,
              { backgroundColor: `${colors.error}1F` },
            ]}
          >
            <Ionicons
              name="notifications-off"
              size={ms(18)}
              color={colors.error}
            />
          </View>
          <View style={styles.cardText}>
            <Typography
              variant="callout"
              weight="bold"
              color={onboardingTokens.textPrimary}
              style={{ fontSize: f(14.5), lineHeight: f(20) }}
            >
              Without notifications
            </Typography>
            <Typography
              variant="footnote"
              color={onboardingTokens.textSecondary}
              style={{ fontSize: f(12), marginTop: ms(2), lineHeight: f(17) }}
            >
              You won't get the trial-ending reminder, and may not realise
              billing has started.
            </Typography>
          </View>
        </View>
      </Animated.View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    marginBottom: ms(22),
  },
  bellCircle: {
    width: ms(84),
    height: ms(84),
    borderRadius: ms(42),
    backgroundColor: onboardingTokens.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: onboardingTokens.cardBorder,
  },
  cardGroup: {
    marginTop: ms(26),
    gap: ms(10),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: onboardingTokens.cardBg,
    borderColor: onboardingTokens.cardBorder,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: ms(14),
    gap: ms(12),
  },
  iconTile: {
    width: ms(38),
    height: ms(38),
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTilePositive: {
    backgroundColor: onboardingTokens.accentSoft,
  },
  cardText: {
    flex: 1,
  },
  skip: {
    marginTop: ms(14),
    paddingVertical: ms(6),
    paddingHorizontal: ms(16),
    alignSelf: 'center',
  },
});
