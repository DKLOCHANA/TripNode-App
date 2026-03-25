import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { Button } from '@/presentation/components/ui/Button';
import { usePaywallViewModel } from '@/presentation/view-models/usePaywallViewModel';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import { shadows } from '@/theme/shadows';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.38;

const FEATURES = [
  'Unlimited AI Itineraries',
  'Offline Travel Guides',
  'Priority Support',
  'Ad-Free Experience',
];

export function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const vm = usePaywallViewModel();
  const { colors } = useTheme();

  // Light theme colors for paywall (matches design)
  const paywallColors = {
    background: '#FFFFFF',
    textPrimary: '#1C1C1E',
    textSecondary: '#8E8E93',
    border: '#E5E5EA',
    checkmark: colors.electricBlue,
    badge: colors.electricBlue,
  };

  return (
    <View style={[styles.container, { backgroundColor: paywallColors.background }]}>
      {/* Background Image with Gradient */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../assets/paywall_background.jpg')}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.8)', paywallColors.background]}
          style={styles.imageGradient}
          locations={[0, 0.6, 1]}
        />
      </View>

      {/* Close Button */}
      <Pressable
        style={[styles.closeButton, { top: insets.top + spacing.sm }]}
        onPress={vm.handleClose}
        hitSlop={12}
      >
        <Ionicons name="close" size={28} color={paywallColors.textSecondary} />
      </Pressable>

      <View
        style={[
          styles.content,
          { 
            paddingTop: IMAGE_HEIGHT - spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >

        {/* Title */}
        <Typography
          variant="title1"
          weight="bold"
          align="center"
          color={paywallColors.textPrimary}
          style={styles.title}
        >
          Unlock the Full{'\n'}Adventure
        </Typography>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Ionicons
                name="checkmark"
                size={20}
                color={paywallColors.checkmark}
                style={styles.checkIcon}
              />
              <Typography
                variant="body"
                color={paywallColors.textPrimary}
              >
                {feature}
              </Typography>
            </View>
          ))}
        </View>

        {/* Plan Cards */}
        <View style={styles.plansContainer}>
          {/* Annual Plan */}
          <Pressable onPress={() => vm.handleSelectPlan('annual')} disabled={vm.isLoadingPackages}>
            <View
              style={[
                styles.planCard,
                { borderColor: vm.selectedPlan === 'annual' ? colors.electricBlue : paywallColors.border },
                vm.selectedPlan === 'annual' && styles.planCardSelected,
                vm.isLoadingPackages && styles.planCardDisabled,
              ]}
            >
              {/* Best Value Badge */}
              <View style={[styles.bestValueBadge, { backgroundColor: paywallColors.badge }]}>
                <Typography variant="caption2" weight="bold" color={colors.white}>
                  BEST VALUE
                </Typography>
              </View>

              <View style={styles.planContent}>
                <View>
                  <Typography variant="headline" weight="semiBold" color={paywallColors.textPrimary}>
                    Annual Plan
                  </Typography>
                  <Typography variant="footnote" color={paywallColors.textSecondary}>
                    {vm.annualPricePerMonth}/month billed annually
                  </Typography>
                </View>
                <View style={styles.priceContainer}>
                  <Typography variant="title2" weight="bold" color={paywallColors.textPrimary}>
                    {vm.annualPrice}
                  </Typography>
                  <Typography variant="caption1" color={paywallColors.textSecondary}>
                    /year
                  </Typography>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Monthly Plan */}
          <Pressable onPress={() => vm.handleSelectPlan('monthly')} disabled={vm.isLoadingPackages}>
            <View
              style={[
                styles.planCard,
                { borderColor: vm.selectedPlan === 'monthly' ? colors.electricBlue : paywallColors.border },
                vm.selectedPlan === 'monthly' && styles.planCardSelected,
                vm.isLoadingPackages && styles.planCardDisabled,
              ]}
            >
              <View style={styles.planContent}>
                <View>
                  <Typography variant="headline" weight="semiBold" color={paywallColors.textPrimary}>
                    Monthly Plan
                  </Typography>
                  <Typography variant="footnote" color={paywallColors.textSecondary}>
                    Cancel anytime
                  </Typography>
                </View>
                <View style={styles.priceContainer}>
                  <Typography variant="title2" weight="bold" color={paywallColors.textPrimary}>
                    {vm.monthlyPrice}
                  </Typography>
                  <Typography variant="caption1" color={paywallColors.textSecondary}>
                    /month
                  </Typography>
                </View>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Continue Button */}
        <Button
          title={vm.isPurchasing ? 'Processing...' : vm.isLoadingPackages ? 'Loading...' : 'Continue'}
          variant="primary"
          size="large"
          onPress={vm.handlePurchase}
          loading={vm.isPurchasing || vm.isLoadingPackages}
          disabled={vm.isLoadingPackages}
          style={styles.continueButton}
        />

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <Pressable onPress={vm.handleRestorePurchases} disabled={vm.isRestoring}>
            <Typography
              variant="caption1"
              color={colors.electricBlue}
              weight="medium"
              style={{ ...styles.footerLink, ...(vm.isRestoring ? styles.linkDisabled : {}) }}
            >
              RESTORE{'\n'}PURCHASES
            </Typography>
          </Pressable>

          <Typography variant="caption1" color={paywallColors.textSecondary}>
            •
          </Typography>

          <Pressable onPress={vm.handleTermsOfService}>
            <Typography
              variant="caption1"
              color={colors.electricBlue}
              weight="medium"
              style={styles.footerLink}
            >
              TERMS OF{'\n'}SERVICE
            </Typography>
          </Pressable>

          <Typography variant="caption1" color={paywallColors.textSecondary}>
            •
          </Typography>

          <Pressable onPress={vm.handlePrivacyPolicy}>
            <Typography
              variant="caption1"
              color={colors.electricBlue}
              weight="medium"
              style={styles.footerLink}
            >
              PRIVACY{'\n'}POLICY
            </Typography>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: IMAGE_HEIGHT,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: IMAGE_HEIGHT * 0.6,
  },
  closeButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    justifyContent: 'flex-end',
  },
  title: {
    marginBottom: spacing.xl,
  },
  featuresContainer: {
    marginBottom: spacing.xl,
    paddingLeft: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkIcon: {
    marginRight: spacing.sm,
  },
  plansContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  planCard: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    ...shadows.card,
  },
  planCardSelected: {
    borderWidth: 2,
  },
  planCardDisabled: {
    opacity: 0.6,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.xs,
  },
  continueButton: {
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  footerLink: {
    textAlign: 'center',
  },
  linkDisabled: {
    opacity: 0.5,
  },
});
