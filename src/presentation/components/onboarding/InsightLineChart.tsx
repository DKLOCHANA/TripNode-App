import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';
import { Typography } from '@/presentation/components/ui/Typography';
import { onboardingTokens, f, ms } from './tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const W = 240;
const H = 130;

// "with TripNode" — rising line. "without" — flat with dips.
const WITH_PATH = 'M14,96 C50,90 78,78 110,58 C150,34 185,26 226,16';
const WITHOUT_PATH = 'M14,96 C52,98 80,100 110,96 C150,90 185,100 226,102';
const WITH_LEN = 280; // generous over-estimate of path length for the draw-in

/** "with vs without TripNode" line chart with an animated draw-in (screen 17). */
export function InsightLineChart() {
  const draw = useRef(new Animated.Value(WITH_LEN)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(draw, {
        toValue: 0,
        duration: 1300,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.card}>
      <Svg width="100%" height={ms(150)} viewBox={`0 0 ${W} ${H}`}>
        <Line
          x1="14"
          y1="110"
          x2="226"
          y2="110"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.75"
        />
        {/* without TripNode */}
        <Path
          d={WITHOUT_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.30)"
          strokeWidth="2"
          strokeDasharray="5,4"
          strokeLinecap="round"
        />
        {/* with TripNode (animated draw-in) */}
        <AnimatedPath
          d={WITH_PATH}
          fill="none"
          stroke={onboardingTokens.accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${WITH_LEN}, ${WITH_LEN}`}
          strokeDashoffset={draw}
        />
        <SvgText x="150" y="12" fill={onboardingTokens.accent} fontSize="9" fontWeight="700">
          with TripNode
        </SvgText>
        <SvgText x="150" y="118" fill="rgba(255,255,255,0.45)" fontSize="9">
          without
        </SvgText>
        <SvgText x="14" y="126" fill="rgba(255,255,255,0.45)" fontSize="8">
          Day 1
        </SvgText>
        <SvgText x="210" y="126" fill="rgba(255,255,255,0.45)" fontSize="8">
          Day 5
        </SvgText>
      </Svg>

      <Animated.View style={[styles.legend, { opacity: fade }]}>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: onboardingTokens.accent }]} />
          <Typography
            variant="caption1"
            color={onboardingTokens.textSecondary}
            style={{ fontSize: f(11) }}
          >
            hidden gems · budget on track · zero wasted hours
          </Typography>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.35)' }]} />
          <Typography
            variant="caption1"
            color={onboardingTokens.textTertiary}
            style={{ fontSize: f(11) }}
          >
            overpaid · closed attractions · 2 hours lost
          </Typography>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: onboardingTokens.cardBg,
    borderColor: onboardingTokens.cardBorder,
    borderWidth: 1,
    borderRadius: ms(16),
    padding: ms(16),
  },
  legend: {
    marginTop: ms(12),
    gap: ms(6),
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  dot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
  },
});
