import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '@/presentation/components/ui/Typography';
import { Button } from '@/presentation/components/ui/Button';
import { GlassContainer } from '@/presentation/components/ui/GlassContainer';
import { EfficiencyBarChart, TimelineComparisonChart, PercentageGauge } from '@/presentation/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type ChartType = 'efficiency' | 'timeline' | 'percentage';

interface EfficiencyChartProps {
  withoutValue: number;
  withValue: number;
  withoutLabel: string;
  withLabel: string;
}

interface TimelineChartProps {
  withoutTime: string;
  withTime: string;
  withoutLabel: string;
  withLabel: string;
}

interface PercentageChartProps {
  withoutValue: number;
  withValue: number;
  withoutLabel: string;
  withLabel: string;
}

type ChartProps = EfficiencyChartProps | TimelineChartProps | PercentageChartProps;

interface AnalyticsScreenProps {
  title: string;
  subtitles: Record<string, string>;
  defaultSubtitle: string;
  supportingText: string;
  chartType: ChartType;
  chartProps: ChartProps;
  nextRoute: string;
  storeKey: 'selectedAnswer1' | 'selectedAnswer2' | 'selectedAnswer3';
}

export function AnalyticsScreen({
  title,
  subtitles,
  defaultSubtitle,
  supportingText,
  chartType,
  chartProps,
  nextRoute,
  storeKey,
}: AnalyticsScreenProps) {
  const insets = useSafeAreaInsets();
  const store = useOnboardingStore();
  const selectedAnswer = store[storeKey];

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const chartOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
      Animated.timing(titleTranslateY, { toValue: 0, duration: 600, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    Animated.timing(chartOpacity, { toValue: 1, duration: 800, delay: 300, useNativeDriver: true }).start();

    Animated.parallel([
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 500, delay: 800, useNativeDriver: true }),
      Animated.timing(subtitleTranslateY, { toValue: 0, duration: 500, delay: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    Animated.timing(textOpacity, { toValue: 1, duration: 500, delay: 1000, useNativeDriver: true }).start();

    Animated.parallel([
      Animated.timing(buttonOpacity, { toValue: 1, duration: 500, delay: 1200, useNativeDriver: true }),
      Animated.timing(buttonTranslateY, { toValue: 0, duration: 500, delay: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const subtitle = selectedAnswer && subtitles[selectedAnswer] ? subtitles[selectedAnswer] : defaultSubtitle;

  const handleContinue = () => {
    router.push(nextRoute as any);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'efficiency':
        return <EfficiencyBarChart {...(chartProps as EfficiencyChartProps)} />;
      case 'timeline':
        return <TimelineComparisonChart {...(chartProps as TimelineChartProps)} />;
      case 'percentage':
        return <PercentageGauge {...(chartProps as PercentageChartProps)} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...gradients.onboarding]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }}>
          <Typography
            variant="title1"
            weight="bold"
            align="center"
            style={styles.title}
          >
            {title}
          </Typography>
        </Animated.View>

        <Animated.View style={[styles.chartContainer, { opacity: chartOpacity }]}>
          <GlassContainer padding={spacing.lg}>
            {renderChart()}
          </GlassContainer>
        </Animated.View>

        <Animated.View style={[styles.subtitleContainer, { opacity: subtitleOpacity, transform: [{ translateY: subtitleTranslateY }] }]}>
          <View style={styles.subtitleBadge}>
            <Typography
              variant="callout"
              weight="semiBold"
              color={colors.electricBlue}
              align="center"
            >
              {subtitle}
            </Typography>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity }}>
          <Typography
            variant="body"
            color={colors.textSecondary}
            align="center"
            style={styles.supportingText}
          >
            {supportingText}
          </Typography>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslateY }] }]}>
          <Button
            title="Continue"
            onPress={handleContinue}
            size="large"
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screen,
  },
  title: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  chartContainer: {
    marginBottom: spacing.xl,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  subtitleBadge: {
    backgroundColor: colors.electricBlueDim,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(10,132,255,0.3)',
  },
  supportingText: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
});
