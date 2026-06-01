import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { useSubscriptionManageViewModel } from '@/presentation/view-models/useSubscriptionManageViewModel';
import { useTheme, type ColorScheme } from '@/theme/ThemeContext';
import { gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

// The premium card is a fixed dark surface in both themes, so its content
// colours are constant (white text + white translucency over the navy
// gradient) — mirroring the local-palette pattern used elsewhere.
const PREMIUM_CARD = {
  title: '#FFFFFF',
  label: 'rgba(255,255,255,0.45)',
  value: '#FFFFFF',
  accent: '#5BA3F9',
  pillBg: 'rgba(255,255,255,0.08)',
} as const;

const PREMIUM_FEATURES = ['Unlimited trips', 'AI itineraries', 'Priority support'] as const;

/** A labelled value pill inside the premium card (Plan / Price / Renews). */
function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={[styles.infoPill, { backgroundColor: PREMIUM_CARD.pillBg }]}>
      <Typography variant="caption2" color={PREMIUM_CARD.label}>
        {label}
      </Typography>
      <Typography variant="footnote" weight="medium" color={PREMIUM_CARD.value} style={styles.infoPillValue}>
        {value}
      </Typography>
    </View>
  );
}

/** A small "✓ feature" chip inside the premium card. */
function FeatureChip({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.featureChip, { backgroundColor: PREMIUM_CARD.pillBg }]}>
      <Ionicons name="checkmark" size={12} color={colors.success} />
      <Typography variant="caption1" color="rgba(255,255,255,0.7)">
        {label}
      </Typography>
    </View>
  );
}

/** A settings row with a tinted icon chip, label (+ optional sub-label),
 *  and either a trailing chevron or a loading spinner. Supports a danger tint. */
function SettingRow({
  icon,
  label,
  sublabel,
  onPress,
  loading,
  danger,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sublabel?: string;
  onPress: () => void;
  loading?: boolean;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  const tint = danger ? colors.error : colors.electricBlue;
  const chipBg = danger ? colors.errorDim : colors.electricBlueDim;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconChip, { backgroundColor: chipBg }]}>
          <Ionicons name={icon} size={16} color={tint} />
        </View>
        <View style={styles.rowTextWrap}>
          <Typography variant="callout" color={danger ? colors.error : colors.textPrimary}>
            {label}
          </Typography>
          {sublabel ? (
            <Typography variant="caption1" color={colors.textTertiary} style={styles.rowSub}>
              {sublabel}
            </Typography>
          ) : null}
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={colors.electricBlue} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      )}
    </Pressable>
  );
}

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
        <Pressable
          onPress={vm.handleGoBack}
          hitSlop={12}
          style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
        </Pressable>
        <Typography variant="headline" weight="semiBold" color={colors.textPrimary}>
          Manage Subscription
        </Typography>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium card */}
        <LinearGradient
          colors={gradients.premium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumCard}
        >
          <View style={styles.premiumTopRow}>
            <View style={styles.premiumTitleRow}>
              <Ionicons name="diamond" size={20} color={PREMIUM_CARD.accent} />
              <Typography variant="title3" weight="semiBold" color={PREMIUM_CARD.title}>
                TripNode Premium
              </Typography>
            </View>
            {(() => {
              const statusColor = vm.isExpired ? colors.error : colors.success;
              const statusBg = vm.isExpired ? colors.errorDim : colors.successDim;
              return (
                <View style={[styles.statusBadge, { backgroundColor: statusBg, borderColor: statusColor }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Typography variant="caption2" weight="bold" color={statusColor}>
                    {vm.isExpired ? 'EXPIRED' : 'ACTIVE'}
                  </Typography>
                </View>
              );
            })()}
          </View>

          <View style={styles.infoPillRow}>
            <InfoPill label="Plan" value={vm.planLabel} />
            {vm.priceLabel ? <InfoPill label="Price" value={vm.priceLabel} /> : null}
            {vm.expiryDateShort ? (
              <InfoPill
                label={vm.renewsAutomatically ? 'Renews' : 'Expires'}
                value={vm.expiryDateShort}
              />
            ) : null}
          </View>

          <View style={styles.featureRow}>
            {PREMIUM_FEATURES.map((feature) => (
              <FeatureChip key={feature} label={feature} />
            ))}
          </View>
        </LinearGradient>

        {/* Manage */}
        <Typography variant="caption1" weight="semiBold" color={colors.textTertiary} style={styles.sectionLabel}>
          MANAGE
        </Typography>
        <View style={[styles.card, cardSurface(colors)]}>
          <SettingRow
            icon="settings-outline"
            label="Subscription Settings"
            onPress={vm.handleOpenCustomerCenter}
            loading={vm.isLoading}
          />
          <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
          <SettingRow
            icon="swap-horizontal"
            label="Change Plan"
            sublabel="Switch between annual & monthly"
            onPress={vm.handleManageSubscription}
          />
          <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
          <SettingRow
            icon="refresh"
            label="Restore Purchases"
            onPress={vm.handleRestorePurchases}
            loading={vm.isLoading}
          />
        </View>

        {/* Cancel — Apple requires a path to cancel from inside the app */}
        <View style={[styles.card, cardSurface(colors)]}>
          <SettingRow
            icon="close-circle-outline"
            label="Cancel Subscription"
            onPress={vm.handleCancelSubscription}
            danger
          />
          <Typography variant="caption1" color={colors.textTertiary} style={styles.cancelNote}>
            You'll be redirected to your App Store subscription settings.
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

/** Shared flat-card surface — adapts to light/dark via theme tokens. */
function cardSurface(colors: ColorScheme) {
  return {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.glassBorder,
  };
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
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
  },

  // Premium card
  premiumCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  premiumTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  premiumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radii.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: radii.full,
  },
  infoPillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  infoPill: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  infoPillValue: {
    marginTop: 2,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs + 2,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.xs,
  },

  // Sections / cards
  sectionLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
    letterSpacing: 0.6,
  },
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowSub: {
    marginTop: 1,
  },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md + 32 + spacing.sm,
  },
  cancelNote: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    marginLeft: 32 + spacing.sm,
    marginTop: -spacing.xs,
  },
});
