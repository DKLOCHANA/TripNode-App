import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '@/presentation/components/ui/Typography';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const LOGO = require('../../../assets/splash-icon.png');

// Deep navy → black backdrop, drawn from the app's brand palette.
const BACKDROP = ['#0A1628', '#0B1526', '#000000'] as const;

const LOGO_SIZE = 116;
const RING_BASE = LOGO_SIZE + 28;

/**
 * Branded splash shown while the app boots (auth + subscription gate resolving)
 * and previewable from Profile. The animated logo + pulsing rings mirror the
 * native launch screen (logo on black) so the hand-off is seamless.
 */
export function AppSplash() {
  const { colors } = useTheme();

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(18)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 650, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 55, useNativeDriver: true }),
    ]).start();

    const pulse = (v: Animated.Value) =>
      Animated.loop(
        Animated.timing(v, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      );

    const r1 = pulse(ring1);
    const r2 = pulse(ring2);
    r1.start();
    // Offset the second ring by half a cycle for a continuous ripple.
    const stagger = setTimeout(() => r2.start(), 1300);

    return () => {
      clearTimeout(stagger);
      r1.stop();
      r2.stop();
    };
  }, [fade, rise, logoScale, ring1, ring2]);

  const ringStyle = (v: Animated.Value) => ({
    transform: [{ scale: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.9, 1.35, 0.9] }) }],
    opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.45, 0, 0.45] }),
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={BACKDROP} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.center, { opacity: fade, transform: [{ translateY: rise }] }]}>
        <View style={styles.logoWrap}>
          <Animated.View style={[styles.ring, { borderColor: colors.electricBlue }, ringStyle(ring1)]} />
          <Animated.View style={[styles.ring, { borderColor: colors.electricBlue }, ringStyle(ring2)]} />
          <Animated.View style={[styles.logoShadow, { shadowColor: colors.electricBlue, transform: [{ scale: logoScale }] }]}>
            <Image source={LOGO} style={styles.logo} resizeMode="cover" />
          </Animated.View>
        </View>

        <Typography variant="largeTitle" weight="bold" color="#FFFFFF" align="center" style={styles.title}>
          TripNode
        </Typography>
        <Typography variant="subheadline" color="rgba(255,255,255,0.6)" align="center" style={styles.tagline}>
          Your AI travel companion
        </Typography>
      </Animated.View>

      {/* Animated loading dots */}
      <Animated.View style={[styles.footer, { opacity: fade }]}>
        <LoadingDots color={colors.electricBlue} />
      </Animated.View>
    </View>
  );
}

function LoadingDots({ color }: { color: string }) {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    const animations = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(d, { toValue: 1, duration: 420, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 420, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.dots}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[styles.dot, { backgroundColor: color, opacity: d, transform: [{ scale: d }] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  // Symmetric insets keep the rings centred on the logo (absolute children
  // without insets pin to the top-left in RN).
  ring: {
    position: 'absolute',
    top: (LOGO_SIZE - RING_BASE) / 2,
    left: (LOGO_SIZE - RING_BASE) / 2,
    width: RING_BASE,
    height: RING_BASE,
    borderRadius: radii.full,
    borderWidth: 1.5,
  },
  logoShadow: {
    borderRadius: 26,
    shadowOpacity: 0.55,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 26,
  },
  title: {
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xxxl + spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
});
