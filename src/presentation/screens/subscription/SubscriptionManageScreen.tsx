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
import { useSubscriptionManageViewModel } from '@/presentation/view-models/useSubscriptionManageViewModel';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

export function SubscriptionManageScreen() {
  const insets = useSafeAreaInsets();
  const vm = useSubscriptionManageViewModel();
  const { colors } = useTheme();

  if (vm.isSubscriptionLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <ActivityIndicator size="large" color={colors.electricBlue} />
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
            <View style={[styles.planBadge, { backgroundColor: colors.electricBlue }]}>
              <Typography variant="caption2" weight="bold" color={colors.white}>
                ACTIVE
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

          {vm.expiryDate && (
            <View style={[styles.expiryContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons
                name={vm.isExpiringSoon ? 'warning' : 'calendar-outline'}
                size={20}
                color={vm.isExpiringSoon ? colors.warning : colors.textSecondary}
              />
              <View style={styles.expiryTextContainer}>
                <Typography variant="footnote" color={colors.textSecondary}>
                  {vm.renewsAutomatically ? 'Renews on' : 'Expires on'}
                </Typography>
                <Typography variant="body" weight="semiBold" color={colors.textPrimary}>
                  {vm.expiryDate}
                </Typography>
              </View>
            </View>
          )}

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
        </GlassContainer>

        {/* Actions Section */}
        <GlassContainer style={styles.actionsCard}>
          <Typography variant="caption1" weight="semiBold" color={colors.textSecondary} style={styles.sectionTitle}>
            MANAGE
          </Typography>

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

          <Pressable style={styles.actionRow} onPress={vm.handleManageSubscription}>
            <View style={styles.actionRowLeft}>
              <Ionicons name="swap-horizontal" size={20} color={colors.electricBlue} style={styles.actionIcon} />
              <Typography variant="body" color={colors.textPrimary}>
                Change Plan
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

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

        {/* Cancel Section — Apple requires a path to cancel from inside the app */}
        <GlassContainer style={styles.actionsCard}>
          <Typography variant="caption1" weight="semiBold" color={colors.textSecondary} style={styles.sectionTitle}>
            CANCEL
          </Typography>

          <Pressable style={styles.actionRow} onPress={vm.handleCancelSubscription}>
            <View style={styles.actionRowLeft}>
              <Ionicons name="close-circle-outline" size={20} color={colors.error} style={styles.actionIcon} />
              <Typography variant="body" color={colors.error}>
                Cancel Subscription
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>

          <Typography variant="caption1" color={colors.textTertiary} style={styles.cancelNote}>
            You'll be redirected to your App Store subscription settings.
          </Typography>
        </GlassContainer>

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
});
