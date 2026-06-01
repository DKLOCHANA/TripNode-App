import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { type InterestId } from '@/lib/constants';
import { getCategoryIcon, getCategoryLabel } from '@/lib/categoryIcons';
import { useTheme } from '@/theme/ThemeContext';
import { gradients } from '@/theme/colors';
import { getInterestColors } from '@/theme/interestColors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type LoadingPhase = 'attractions' | 'itinerary';

interface TripSummary {
  destinationName: string;
  interests: InterestId[];
  days: number | null;
  budgetLabel: string | null;
  phase?: LoadingPhase;
}

type Step = { icon: IoniconName; label: string; color: string };

// Rotating progress messages (decorative accent colours for each step).
const ATTRACTION_STEPS: Step[] = [
  { icon: 'search', label: 'Scanning top-rated attractions…', color: '#2D7CF6' },
  { icon: 'heart', label: 'Matching your interests…', color: '#D85A30' },
  { icon: 'location', label: 'Clustering nearby locations…', color: '#1D9E75' },
  { icon: 'sparkles', label: 'Curating your perfect list…', color: '#534AB7' },
];

const ITINERARY_STEPS: Step[] = [
  { icon: 'calendar', label: 'Building your day-by-day plan…', color: '#2D7CF6' },
  { icon: 'map', label: 'Grouping nearby stops to cut travel…', color: '#1D9E75' },
  { icon: 'time', label: 'Scheduling the best times to visit…', color: '#D85A30' },
  { icon: 'sparkles', label: 'Finalising your itinerary…', color: '#534AB7' },
];

const COPY: Record<LoadingPhase, { title: (dest: string) => string; subtitle: string }> = {
  attractions: {
    title: (dest) => `Exploring ${dest}`,
    subtitle: 'Our AI is finding the best spots for you',
  },
  itinerary: {
    title: (dest) => `Planning ${dest}`,
    subtitle: 'Our AI is arranging your daily schedule',
  },
};

export function AttractionLoadingState({ destinationName, interests, days, budgetLabel, phase = 'attractions' }: TripSummary) {
  const { colors, isDark } = useTheme();
  const STEPS = phase === 'itinerary' ? ITINERARY_STEPS : ATTRACTION_STEPS;
  const copy = COPY[phase];

  const spin = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const stepFade = useRef(new Animated.Value(1)).current;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    );
    const pulse = (v: Animated.Value) =>
      Animated.loop(
        Animated.timing(v, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      );

    spinLoop.start();
    const ring1Loop = pulse(ring1);
    const ring2Loop = pulse(ring2);
    ring1Loop.start();
    // Stagger the second ring by half a cycle for a continuous ripple.
    const stagger = setTimeout(() => ring2Loop.start(), 1250);

    Animated.timing(progress, {
      toValue: 1,
      duration: 13000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    const cycle = setInterval(() => {
      Animated.timing(stepFade, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setStepIndex((i) => (i + 1) % STEPS.length);
        Animated.timing(stepFade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    }, 2800);

    return () => {
      clearTimeout(stagger);
      clearInterval(cycle);
      spinLoop.stop();
      ring1Loop.stop();
      ring2Loop.stop();
    };
  }, [progress, ring1, ring2, spin, stepFade]);

  const ringStyle = (v: Animated.Value) => ({
    transform: [{ scale: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.85, 1.2, 0.85] }) }],
    opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0, 0.5] }),
  });

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '92%'] });
  const step = STEPS[stepIndex];

  const footerParts = [days ? `${days} ${days === 1 ? 'day' : 'days'}` : null, budgetLabel ? `${budgetLabel} budget` : null].filter(Boolean);

  return (
    <View style={styles.container}>
      {/* Animated icon */}
      <View style={styles.iconWrap}>
        <Animated.View style={[styles.ring, styles.ring1, { borderColor: colors.electricBlueDim }, ringStyle(ring1)]} />
        <Animated.View style={[styles.ring, styles.ring2, { borderColor: colors.electricBlueDim }, ringStyle(ring2)]} />
        <View style={[styles.iconCircle, { backgroundColor: colors.electricBlueDim }]}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="compass" size={44} color={colors.electricBlue} />
          </Animated.View>
        </View>
      </View>

      <Typography variant="title2" weight="semiBold" color={colors.textPrimary} align="center">
        {copy.title(destinationName)}
      </Typography>
      <Typography variant="subheadline" color={colors.textTertiary} align="center" style={styles.subtitle}>
        {copy.subtitle}
      </Typography>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.backgroundTertiary }]}>
        <Animated.View style={[styles.progressFillWrap, { width: progressWidth }]}>
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* Rotating step */}
      <Animated.View style={[styles.step, { opacity: stepFade }]}>
        <Ionicons name={step.icon} size={15} color={step.color} />
        <Typography variant="footnote" color={colors.textSecondary}>
          {step.label}
        </Typography>
      </Animated.View>

      {/* Interest pills */}
      {interests.length > 0 ? (
        <View style={styles.pills}>
          {interests.map((id) => {
            const tint = getInterestColors(id, isDark).text;
            return (
              <View key={id} style={[styles.pill, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name={getCategoryIcon(id)} size={13} color={tint} />
                <Typography variant="caption1" color={colors.textSecondary}>
                  {getCategoryLabel(id)}
                </Typography>
              </View>
            );
          })}
        </View>
      ) : null}

      {footerParts.length > 0 ? (
        <Typography variant="caption2" color={colors.textTertiary} align="center" style={styles.footer}>
          {footerParts.join('  ·  ')}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  ring: {
    position: 'absolute',
    borderRadius: radii.full,
    borderWidth: 2,
  },
  // Symmetric insets relative to the 110×110 wrap keep the rings centred on the
  // icon (an inset-less absolute child would pin to the top-left in RN).
  ring1: {
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
  },
  ring2: {
    top: -28,
    left: -28,
    right: -28,
    bottom: -28,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  progressTrack: {
    width: '100%',
    maxWidth: 260,
    height: 4,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFillWrap: {
    height: '100%',
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 22,
    marginBottom: spacing.xl,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  footer: {
    marginTop: spacing.md,
  },
});
