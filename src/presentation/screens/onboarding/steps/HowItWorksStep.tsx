import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { OnboardingButton, onboardingTokens, f, ms } from '@/presentation/components/onboarding';
import { gradients } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeContext';
import type { HowItWorksStepDef, StepRendererProps } from '@/config/onboarding/types';

type Props = StepRendererProps<HowItWorksStepDef>;

/** Screen 18 — "how it works" bottom-sheet modal over the dark backdrop. */
export function HowItWorksStep({ step, onNext }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scrim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scrim, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 360, useNativeDriver: true }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...gradients.onboarding]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
      />
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.scrim, { opacity: scrim }]}
      />

      <View style={styles.fill} />

      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + ms(20),
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Pressable
          onPress={onNext}
          hitSlop={10}
          style={styles.close}
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={ms(20)} color="rgba(255,255,255,0.5)" />
        </Pressable>

        <Typography
          variant="title3"
          weight="bold"
          color={onboardingTokens.textPrimary}
          align="center"
          style={{ fontSize: f(18), marginBottom: ms(18) }}
        >
          {step.title}
        </Typography>

        {step.steps.map((s, i) => (
          <View key={i} style={styles.stepRow}>
            <View
              style={[styles.stepNum, { backgroundColor: colors.electricBlue }]}
            >
              <Typography
                variant="footnote"
                weight="heavy"
                color="#FFFFFF"
                style={{ fontSize: f(12) }}
              >
                {i + 1}
              </Typography>
            </View>
            <Typography
              variant="footnote"
              weight="semiBold"
              color={onboardingTokens.textPrimary}
              style={{ fontSize: f(14), flex: 1, lineHeight: f(20) }}
            >
              {s}
            </Typography>
          </View>
        ))}

        <Typography
          variant="footnote"
          color={onboardingTokens.textSecondary}
          align="center"
          style={{ fontSize: f(12), marginTop: ms(16), fontStyle: 'italic' }}
        >
          {step.footer}
        </Typography>

        <View style={{ marginTop: ms(20) }}>
          <OnboardingButton title={step.cta} onPress={onNext} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  scrim: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  fill: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#101D33',
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
    borderWidth: 1,
    borderColor: onboardingTokens.cardBorder,
    paddingHorizontal: ms(22),
    paddingTop: ms(26),
  },
  close: {
    position: 'absolute',
    top: ms(14),
    right: ms(14),
    zIndex: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ms(10),
    marginTop: ms(12),
  },
  stepNum: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
