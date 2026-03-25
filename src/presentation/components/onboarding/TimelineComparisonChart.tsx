import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '@/presentation/components/ui/Typography';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_WIDTH = SCREEN_WIDTH - spacing.screen * 4;

interface TimelineComparisonChartProps {
  withoutTime: string;
  withTime: string;
  withoutLabel: string;
  withLabel: string;
}

export function TimelineComparisonChart({
  withoutTime,
  withTime,
  withoutLabel,
  withLabel,
}: TimelineComparisonChartProps) {
  const withoutWidth = useRef(new Animated.Value(0)).current;
  const withWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(withoutWidth, {
        toValue: TIMELINE_WIDTH,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(600),
      Animated.timing(withWidth, {
        toValue: TIMELINE_WIDTH * 0.08,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Without TripNode */}
      <View style={styles.timelineRow}>
        <Typography
          variant="caption1"
          color={colors.textTertiary}
          style={styles.label}
        >
          {withoutLabel}
        </Typography>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barWithout, { width: withoutWidth }]}>
            <LinearGradient
              colors={['rgba(255,69,58,0.6)', 'rgba(255,69,58,0.2)']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>
        <Typography
          variant="headline"
          weight="bold"
          color={colors.textSecondary}
          style={styles.time}
        >
          {withoutTime}
        </Typography>
      </View>

      {/* With TripNode */}
      <View style={styles.timelineRow}>
        <Typography
          variant="caption1"
          color={colors.textSecondary}
          style={styles.label}
        >
          {withLabel}
        </Typography>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barWith, { width: withWidth }]}>
            <LinearGradient
              colors={[colors.electricBlue, 'rgba(10,132,255,0.4)']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>
        <Typography
          variant="headline"
          weight="bold"
          color={colors.electricBlue}
          style={styles.time}
        >
          {withTime}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  timelineRow: {
    gap: spacing.sm,
  },
  label: {
    marginLeft: spacing.xxs,
  },
  barTrack: {
    height: 24,
    backgroundColor: colors.glassSurface,
    borderRadius: radii.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  barWithout: {
    height: '100%',
    borderRadius: radii.sm,
  },
  barWith: {
    height: '100%',
    borderRadius: radii.sm,
    minWidth: 4,
  },
  gradient: {
    flex: 1,
    borderRadius: radii.sm,
  },
  time: {
    marginTop: spacing.xxs,
    alignSelf: 'flex-end',
  },
});
