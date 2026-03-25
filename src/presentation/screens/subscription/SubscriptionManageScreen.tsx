import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { GlassContainer } from '@/presentation/components/ui/GlassContainer';
import { Button } from '@/presentation/components/ui/Button';
import { useSubscriptionManageViewModel } from '@/presentation/view-models/useSubscriptionManageViewModel';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import { shadows } from '@/theme/shadows';

export function SubscriptionManageScreen() {
  const insets = useSafeAreaInsets();
  const vm = useSubscriptionManageViewModel();
  const { colors, isDark } = useTheme();

  if (vm.isSubscriptionLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <ActivityIndicator size="large" color={colors.electricBlue} />
      </View>
    );
  }

  // Show free tier view if not pro and not expired
  if (!vm.isPro && !vm.isExpired) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={vm.handleGoBack} hitSlop={12} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
          </Pressable>
          <Typography variant="headline" weight="semiBold" color={colors.textPrimary}>
            Subscription
          </Typography>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.freeContent}>
          <View style={[styles.freeIconContainer, { backgroundColor: colors.electricBlueDim }]}>
            <Ionicons name="sparkles-outline" size={48} color={colors.electricBlue} />
          </View>
          
          <Typography variant="title2" weight="bold" align="center" color={colors.textPrimary} style={styles.freeTitle}>
            Unlock Premium Features
          </Typography>
          
          <Typography variant="body" color={colors.textSecondary} align="center" style={styles.freeDescription}>
            Get unlimited AI itineraries, offline guides, and more with TripNode Premium.
          </Typography>

          <Button
            title="Upgrade to Premium"
            variant="primary"
            size="large"
            onPress={vm.handleRenewSubscription}
            style={styles.upgradeButton}
          />

          <Pressable onPress={vm.handleRestorePurchases} disabled={vm.isLoading}>
            <Typography variant="footnote" color={colors.electricBlue} weight="medium">
              {vm.isLoading ? 'Restoring...' : 'Restore Purchases'}
            </Typography>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={vm.handleGoBack} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </Pressable>
        <Typography variant="headline" weight="semiBold" color={colors.textPrimary}>
          Manage Subscription
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Card */}
        <GlassContainer style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={[styles.planBadge, { backgroundColor: vm.isExpired ? colors.error : colors.electricBlue }]}>
              <Typography variant="caption2" weight="bold" color={colors.white}>
                {vm.isExpired ? 'EXPIRED' : 'ACTIVE'}
              </Typography>
            </View>
          </View>

          <View style={styles.planInfo}>
            <Typography variant="title2" weight="bold" color={colors.textPrimary}>
              TripNode Premium
            </Typography>
            <Typography variant="body" color={colors.textSecondary} style={styles.planType}>
              {vm.planName}
            </Typography>
          </View>

          {/* Expiry Info */}
          {vm.expiryDate && (
            <View style={[styles.expiryContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons 
                name={vm.isExpired ? 'alert-circle' : vm.isExpiringSoon ? 'warning' : 'calendar-outline'} 
                size={20} 
                color={vm.isExpired ? colors.error : vm.isExpiringSoon ? colors.warning : colors.textSecondary} 
              />
              <View style={styles.expiryTextContainer}>
                <Typography variant="footnote" color={colors.textSecondary}>
                  {vm.isExpired ? 'Expired on' : vm.renewsAutomatically ? 'Renews on' : 'Expires on'}
                </Typography>
                <Typography variant="body" weight="semiBold" color={colors.textPrimary}>
                  {vm.expiryDate}
                </Typography>
              </View>
            </View>
          )}

          {/* Expiring Soon Warning */}
          {vm.isExpiringSoon && !vm.renewsAutomatically && (
            <View style={[styles.warningBanner, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="warning" size={18} color={colors.warning} />
              <Typography variant="footnote" color={colors.warning} style={styles.warningText}>
                {vm.daysUntilExpiry === 1 
                  ? 'Your subscription expires tomorrow!' 
                  : `Your subscription expires in ${vm.daysUntilExpiry} days`}
              </Typography>
            </View>
          )}

          {/* Expired Banner */}
          {vm.isExpired && (
            <View style={[styles.warningBanner, { backgroundColor: `${colors.error}20` }]}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Typography variant="footnote" color={colors.error} style={styles.warningText}>
                Your subscription has expired. Renew to continue enjoying premium features.
              </Typography>
            </View>
          )}
        </GlassContainer>

        {/* Actions Section */}
        <GlassContainer style={styles.actionsCard}>
          <Typography variant="caption1" weight="semiBold" color={colors.textSecondary} style={styles.sectionTitle}>
            MANAGE
          </Typography>

          {vm.isExpired ? (
            <>
              {/* Renew Button for Expired */}
              <Pressable 
                style={styles.actionRow} 
                onPress={vm.handleRenewSubscription}
              >
                <View style={styles.actionRowLeft}>
                  <Ionicons name="refresh" size={20} color={colors.electricBlue} style={styles.actionIcon} />
                  <Typography variant="body" color={colors.textPrimary}>
                    Renew Subscription
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>

              <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            </>
          ) : (
            <>
              {/* Customer Center */}
              <Pressable 
                style={styles.actionRow} 
                onPress={vm.handleOpenCustomerCenter}
                disabled={vm.isLoading}
              >
                <View style={styles.actionRowLeft}>
                  <Ionicons name="settings-outline" size={20} color={colors.electricBlue} style={styles.actionIcon} />
                  <Typography variant="body" color={colors.textPrimary}>
                    Subscription Settings
                  </Typography>
                </View>
                {vm.isLoading ? (
                  <ActivityIndicator size="small" color={colors.electricBlue} />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                )}
              </Pressable>

              <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

              {/* Change Plan */}
              <Pressable 
                style={styles.actionRow} 
                onPress={vm.handleManageSubscription}
              >
                <View style={styles.actionRowLeft}>
                  <Ionicons name="swap-horizontal" size={20} color={colors.electricBlue} style={styles.actionIcon} />
                  <Typography variant="body" color={colors.textPrimary}>
                    Change Plan
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>

              <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            </>
          )}

          {/* Restore Purchases */}
          <Pressable 
            style={styles.actionRow} 
            onPress={vm.handleRestorePurchases}
            disabled={vm.isLoading}
          >
            <View style={styles.actionRowLeft}>
              <Ionicons name="cloud-download-outline" size={20} color={colors.electricBlue} style={styles.actionIcon} />
              <Typography variant="body" color={colors.textPrimary}>
                Restore Purchases
              </Typography>
            </View>
            {vm.isLoading ? (
              <ActivityIndicator size="small" color={colors.electricBlue} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            )}
          </Pressable>
        </GlassContainer>

        {/* Downgrade Section (only for active subscriptions) */}
        {vm.isPro && !vm.isExpired && (
          <GlassContainer style={styles.actionsCard}>
            <Typography variant="caption1" weight="semiBold" color={colors.textSecondary} style={styles.sectionTitle}>
              CANCEL
            </Typography>

            <Pressable 
              style={styles.actionRow} 
              onPress={vm.handleDowngradeToFree}
            >
              <View style={styles.actionRowLeft}>
                <Ionicons name="arrow-down-circle-outline" size={20} color={colors.error} style={styles.actionIcon} />
                <Typography variant="body" color={colors.error}>
                  Downgrade to Free
                </Typography>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            <Typography variant="caption1" color={colors.textTertiary} style={styles.cancelNote}>
              Your Premium access will continue until the end of your current billing period.
            </Typography>
          </GlassContainer>
        )}

        {/* Features Info */}
        <View style={styles.featuresInfo}>
          <Typography variant="caption1" color={colors.textTertiary} align="center">
            Premium features include unlimited AI itineraries, offline guides, priority support, and an ad-free experience.
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
  },
  planCard: {
    marginBottom: spacing.lg,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  planBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.xs,
  },
  planInfo: {
    marginBottom: spacing.md,
  },
  planType: {
    marginTop: spacing.xxs,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.sm,
    gap: spacing.sm,
  },
  expiryTextContainer: {
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  warningText: {
    flex: 1,
  },
  actionsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    marginRight: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  cancelNote: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  featuresInfo: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  // Free tier styles
  freeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  freeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  freeTitle: {
    marginBottom: spacing.md,
  },
  freeDescription: {
    marginBottom: spacing.xl,
  },
  upgradeButton: {
    width: '100%',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
});
