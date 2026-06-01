import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  BackHandler,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { usePaywallViewModel } from '@/presentation/view-models/usePaywallViewModel';
import { useTheme } from '@/theme/ThemeContext';
import { gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

// The paywall is always dark, so its content colours are constant.
const P = {
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.4)',
  faint: 'rgba(255,255,255,0.25)',
  legal: 'rgba(255,255,255,0.22)',
  cardBg: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.09)',
  planUnselBg: 'rgba(255,255,255,0.04)',
  planUnselBorder: 'rgba(255,255,255,0.10)',
  planSelBg: 'rgba(45,124,246,0.12)',
  planSelBorder: 'rgba(45,124,246,0.45)',
  radioOff: 'rgba(255,255,255,0.22)',
  glow: 'rgba(45,124,246,0.10)',
} as const;

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const FEATURES: { icon: IoniconName; label: string; tint: string; bg: string }[] = [
  { icon: 'sparkles', label: 'Unlimited AI\nItineraries', tint: '#5BA3F9', bg: 'rgba(45,124,246,0.15)' },
  { icon: 'cloud-download-outline', label: 'Offline Travel\nGuides', tint: '#5DCAA5', bg: 'rgba(29,158,117,0.15)' },
  { icon: 'headset-outline', label: 'Priority\nSupport', tint: '#AFA9EC', bg: 'rgba(83,74,183,0.15)' },
  { icon: 'remove-circle-outline', label: 'Ad-Free\nExperience', tint: '#F0997B', bg: 'rgba(216,90,48,0.15)' },
];

export function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const vm = usePaywallViewModel();
  const { colors } = useTheme();

  // Hard paywall: block Android hardware back so the user can't dismiss without
  // purchasing or restoring.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  // Gentle float on the diamond + sweeping shimmer on the CTA.
  const float = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [float, shimmer]);

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-180, 220] });

  const annualSelected = vm.selectedPlan === 'annual';
  const ctaLabel = vm.isPurchasing
    ? 'Processing…'
    : vm.isLoadingPackages
      ? 'Loading…'
      : annualSelected
        ? 'Start free trial'
        : 'Subscribe';
  const ctaSubtext = annualSelected ? `${vm.freeTrialDays}-day free trial · Cancel anytime` : 'Cancel anytime';
  const ctaDisabled = vm.isLoadingPackages || vm.isPurchasing;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.paywall} style={StyleSheet.absoluteFill} />
      <View style={[styles.glow, styles.glow1]} />
      <View style={[styles.glow, styles.glow2]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        {/* Expired notice */}
        {vm.isExpired ? (
          <View style={styles.expiredBanner}>
            <Ionicons name="alert-circle" size={18} color="#FFB4A8" />
            <Typography variant="footnote" weight="medium" color="#FFD2C9" style={styles.expiredText}>
              Your subscription has expired. Renew to continue using TripNode Premium.
            </Typography>
          </View>
        ) : null}

        {/* Hero */}
        <View style={styles.hero}>
          <Animated.View style={{ transform: [{ translateY: floatY }] }}>
            <LinearGradient
              colors={gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.diamond}
            >
              <Ionicons name="diamond" size={30} color={P.text} />
            </LinearGradient>
          </Animated.View>
          <Typography variant="title1" weight="bold" color={P.text} align="center">
            Unlock the full{'\n'}adventure
          </Typography>
          <Typography variant="footnote" color={P.muted} align="center" style={styles.heroSub}>
            Get the most out of every trip
          </Typography>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                <Ionicons name={f.icon} size={18} color={f.tint} />
              </View>
              <Typography variant="footnote" weight="medium" color={P.text} align="center">
                {f.label}
              </Typography>
            </View>
          ))}
        </View>

        {/* Plans */}
        <PlanCard
          selected={annualSelected}
          onPress={() => vm.handleSelectPlan('annual')}
          title="Annual"
          subtitle={`${vm.annualPricePerMonth}/month, billed yearly`}
          price={vm.annualPrice}
          strikethrough={vm.annualOriginalPrice}
          badge={vm.annualSavingsPercent ? `SAVE ${vm.annualSavingsPercent}%` : undefined}
          accent={colors.electricBlue}
        />
        <PlanCard
          selected={!annualSelected}
          onPress={() => vm.handleSelectPlan('monthly')}
          title="Monthly"
          subtitle="Cancel anytime"
          price={vm.monthlyPrice}
          priceSub="/month"
          accent={colors.electricBlue}
        />

        {/* CTA */}
        <Pressable
          onPress={vm.handlePurchase}
          disabled={ctaDisabled}
          style={[styles.cta, ctaDisabled && styles.ctaDisabled]}
        >
          <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <Typography variant="headline" weight="semiBold" color={P.text}>
            {ctaLabel}
          </Typography>
        </Pressable>

        <Typography variant="caption1" color={P.faint} align="center" style={styles.ctaSubtext}>
          {ctaSubtext}
        </Typography>

        {/* Legal */}
        <View style={styles.legal}>
          <Pressable onPress={vm.handleRestorePurchases} disabled={vm.isRestoring} hitSlop={8}>
            <Typography variant="caption2" color={vm.isRestoring ? P.faint : P.legal}>
              Restore
            </Typography>
          </Pressable>
          <Typography variant="caption2" color={P.legal}>
            ·
          </Typography>
          <Pressable onPress={vm.handleTermsOfService} hitSlop={8}>
            <Typography variant="caption2" color={P.legal}>
              Terms
            </Typography>
          </Pressable>
          <Typography variant="caption2" color={P.legal}>
            ·
          </Typography>
          <Pressable onPress={vm.handlePrivacyPolicy} hitSlop={8}>
            <Typography variant="caption2" color={P.legal}>
              Privacy
            </Typography>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  selected,
  onPress,
  title,
  subtitle,
  price,
  priceSub,
  strikethrough,
  badge,
  accent,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle: string;
  price: string;
  priceSub?: string;
  strikethrough?: string | null;
  badge?: string;
  accent: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.plan,
        {
          backgroundColor: selected ? P.planSelBg : P.planUnselBg,
          borderColor: selected ? P.planSelBorder : P.planUnselBorder,
        },
      ]}
    >
      {badge ? (
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveBadge}>
          <Typography variant="caption2" weight="bold" color={P.text} style={styles.saveBadgeText}>
            {badge}
          </Typography>
        </LinearGradient>
      ) : null}

      <View style={styles.planInner}>
        <View style={styles.planLeft}>
          <View style={[styles.radio, { borderColor: selected ? accent : P.radioOff }]}>
            {selected ? <View style={[styles.radioDot, { backgroundColor: accent }]} /> : null}
          </View>
          <View>
            <Typography variant="callout" weight="semiBold" color={selected ? P.text : 'rgba(255,255,255,0.7)'}>
              {title}
            </Typography>
            <Typography variant="caption1" color={P.muted} style={styles.planSubtitle}>
              {subtitle}
            </Typography>
          </View>
        </View>

        <View style={styles.planRight}>
          <Typography variant="title3" weight="semiBold" color={selected ? P.text : 'rgba(255,255,255,0.7)'}>
            {price}
          </Typography>
          {strikethrough ? (
            <Typography variant="caption1" color={P.faint} style={styles.strike}>
              {strikethrough}
            </Typography>
          ) : priceSub ? (
            <Typography variant="caption1" color={P.faint}>
              {priceSub}
            </Typography>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    borderRadius: radii.full,
    backgroundColor: P.glow,
  },
  glow1: {
    top: -60,
    right: -50,
    width: 230,
    height: 230,
  },
  glow2: {
    bottom: 160,
    left: -70,
    width: 210,
    height: 210,
  },
  scroll: {
    paddingHorizontal: spacing.screen,
  },

  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,69,58,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,120,108,0.4)',
    marginBottom: spacing.md,
  },
  expiredText: {
    flex: 1,
  },

  hero: {
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  diamond: {
    width: 68,
    height: 68,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroSub: {
    marginTop: spacing.xs,
  },

  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  feature: {
    flexGrow: 1,
    flexBasis: '47%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: P.cardBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: P.cardBorder,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },

  plan: {
    borderRadius: radii.md,
    borderWidth: 1.5,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  saveBadge: {
    position: 'absolute',
    top: -9,
    right: spacing.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radii.xs,
  },
  saveBadgeText: {
    letterSpacing: 0.5,
  },
  planInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
  },
  planSubtitle: {
    marginTop: 2,
  },
  planRight: {
    alignItems: 'flex-end',
  },
  strike: {
    textDecorationLine: 'line-through',
    marginTop: 1,
  },

  cta: {
    height: 54,
    borderRadius: radii.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
  },
  ctaSubtext: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  legal: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
});
