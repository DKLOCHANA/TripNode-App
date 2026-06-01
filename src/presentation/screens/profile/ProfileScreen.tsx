import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { GlassContainer } from '@/presentation/components/ui/GlassContainer';
import { Button } from '@/presentation/components/ui/Button';
import { useProfileViewModel } from '@/presentation/view-models/useProfileViewModel';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme, type ColorScheme } from '@/theme/ThemeContext';
import { gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import { typography } from '@/theme/typography';
import { shadows } from '@/theme/shadows';

// The premium card is a fixed dark surface in both themes, so its content
// colours are constant (white text + white translucency over the navy
// gradient) — mirroring the local-palette pattern used by the paywall screen.
const PREMIUM_CARD = {
  title: '#FFFFFF',
  subtitle: 'rgba(255,255,255,0.55)',
  accent: '#5BA3F9',
  buttonBg: 'rgba(255,255,255,0.15)',
} as const;

/** A single rounded stat tile (Trips / Countries / Activities). */
function StatTile({ value, label }: { value: number; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statTile, cardSurface(colors)]}>
      <Typography variant="title2" weight="bold" color={colors.textPrimary}>
        {value}
      </Typography>
      <Typography variant="caption1" color={colors.textSecondary} style={styles.statLabel}>
        {label}
      </Typography>
    </View>
  );
}

/** Brand-tinted rounded icon chip used at the start of settings rows. */
function IconChip({ name }: { name: React.ComponentProps<typeof Ionicons>['name'] }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.iconChip, { backgroundColor: colors.electricBlueDim }]}>
      <Ionicons name={name} size={16} color={colors.electricBlue} />
    </View>
  );
}

/** A settings row with an icon chip, label (+ optional sub-label) and a Switch. */
function ToggleRow({
  icon,
  label,
  sublabel,
  value,
  onValueChange,
  disabled,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sublabel?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <IconChip name={icon} />
        <View style={styles.rowTextWrap}>
          <Typography variant="callout" color={colors.textPrimary}>
            {label}
          </Typography>
          {sublabel ? (
            <Typography variant="caption1" color={colors.textTertiary} style={styles.rowSub}>
              {sublabel}
            </Typography>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.backgroundTertiary, true: colors.electricBlue }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.backgroundTertiary}
      />
    </View>
  );
}

/** A tappable settings row with an icon chip, label and a trailing chevron. */
function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <IconChip name={icon} />
        <Typography variant="callout" color={colors.textPrimary}>
          {label}
        </Typography>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const vm = useProfileViewModel();
  const notifications = useNotifications();
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter(); // TEMP: paywall test button

  const scrollContentStyle = [
    styles.scrollContent,
    { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxxl },
  ];

  const deleteInputStyle = [
    styles.deleteInput,
    {
      backgroundColor: colors.glassInputBg,
      borderColor: colors.glassBorder,
      color: colors.textPrimary,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Typography variant="title1" weight="bold" color={colors.textPrimary} style={styles.pageTitle}>
          Profile
        </Typography>

        {/* Identity card */}
        <View style={[styles.identityCard, cardSurface(colors)]}>
          <Pressable style={styles.avatarContainer} onPress={vm.handleAvatarPress}>
            {vm.userPhotoURL ? (
              <Image
                source={{ uri: vm.userPhotoURL }}
                style={styles.avatar}
                contentFit="cover"
                cachePolicy="disk"
              />
            ) : (
              <LinearGradient
                colors={gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Typography variant="title2" weight="bold" color={colors.white}>
                  {vm.userInitials}
                </Typography>
              </LinearGradient>
            )}
            <View style={[styles.avatarBadge, { backgroundColor: colors.backgroundPrimary }]}>
              <Ionicons
                name={vm.hasLocalPhoto ? 'pencil' : 'camera'}
                size={12}
                color={colors.textSecondary}
              />
            </View>
          </Pressable>

          <View style={styles.identityText}>
            <View style={styles.nameRow}>
              <Typography variant="title3" weight="semiBold" color={colors.textPrimary} numberOfLines={1}>
                {vm.userName}
              </Typography>
              <View style={[styles.proBadge, { backgroundColor: colors.electricBlue }]}>
                <Typography variant="caption2" weight="bold" color={colors.white}>
                  PRO
                </Typography>
              </View>
            </View>
            <Typography variant="footnote" color={colors.textSecondary} numberOfLines={1}>
              {vm.userEmail}
            </Typography>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatTile value={vm.tripsCount} label="Trips" />
          <StatTile value={vm.countriesCount} label="Countries" />
          <StatTile value={vm.activitiesCount} label="Activities" />
        </View>

        {/* Premium card */}
        <LinearGradient
          colors={gradients.premium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumCard}
        >
          <View style={styles.premiumInfo}>
            <View style={styles.premiumTitleRow}>
              <Ionicons name="diamond" size={14} color={PREMIUM_CARD.accent} />
              <Typography variant="subheadline" weight="semiBold" color={PREMIUM_CARD.title}>
                TripNode Premium
              </Typography>
            </View>
            {vm.subscriptionExpiry ? (
              <Typography variant="caption1" color={PREMIUM_CARD.subtitle} style={styles.premiumSub}>
                {vm.renewsAutomatically ? 'Renews' : 'Expires'} {vm.subscriptionExpiry}
              </Typography>
            ) : null}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.premiumButton,
              { backgroundColor: PREMIUM_CARD.buttonBg },
              pressed && styles.rowPressed,
            ]}
            onPress={vm.handleManageSubscription}
          >
            <Typography variant="footnote" weight="medium" color={PREMIUM_CARD.title}>
              Manage
            </Typography>
          </Pressable>
        </LinearGradient>

        {/* Preferences */}
        <Typography variant="caption1" weight="semiBold" color={colors.textTertiary} style={styles.sectionLabel}>
          PREFERENCES
        </Typography>
        <View style={[styles.card, cardSurface(colors)]}>
          <ToggleRow
            icon={isDark ? 'moon' : 'sunny'}
            label={isDark ? 'Dark Mode' : 'Light Mode'}
            value={isDark}
            onValueChange={toggleTheme}
          />
          <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
          <ToggleRow
            icon="notifications"
            label="Trip Reminders"
            sublabel="Countdown & departure alerts"
            value={notifications.enabled}
            onValueChange={notifications.toggle}
            disabled={!notifications.isHydrated}
          />
        </View>

        {/* Information */}
        <Typography variant="caption1" weight="semiBold" color={colors.textTertiary} style={styles.sectionLabel}>
          INFORMATION
        </Typography>
        <View style={[styles.card, cardSurface(colors)]}>
          <LinkRow icon="shield-checkmark" label="Privacy Policy" onPress={vm.handlePrivacyPolicy} />
          <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
          <LinkRow icon="document-text" label="Terms of Service" onPress={vm.handleTermsOfService} />
          <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
          <LinkRow icon="help-circle" label="Help & Support" onPress={vm.handleHelpSupport} />
        </View>

        {/* TEMP: paywall test button — remove before release */}
        <View style={styles.actionsSection}>
          <Button
            title="Open Paywall (TEMP)"
            variant="secondary"
            onPress={() => router.push('/paywall')}
            icon={<Ionicons name="card-outline" size={18} color={colors.textPrimary} />}
          />
        </View>

        {/* Account actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Log Out"
            variant="secondary"
            onPress={vm.handleLogout}
            loading={vm.isLoggingOut}
            icon={<Ionicons name="log-out-outline" size={18} color={colors.textPrimary} />}
          />
          <Button
            title="Delete Account"
            variant="destructive"
            onPress={vm.handleDeletePress}
          />
        </View>

        {/* App Version */}
        <Typography variant="caption2" color={colors.textTertiary} align="center" style={styles.version}>
          TripNode v1.0.0
        </Typography>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={vm.deleteStep !== 'idle'}
        transparent
        animationType="fade"
        onRequestClose={vm.handleDeleteCancel}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={vm.handleDeleteCancel} />

          <GlassContainer style={styles.modalContent}>
            {vm.deleteStep === 'confirm' && (
              <>
                <Typography variant="headline" weight="bold" align="center" color={colors.textPrimary}>
                  Delete Account?
                </Typography>
                <Typography
                  variant="body"
                  color={colors.textSecondary}
                  align="center"
                  style={styles.modalText}
                >
                  This will permanently delete your account and all your trips. This action cannot be undone.
                </Typography>

                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={vm.handleDeleteCancel}
                    style={styles.modalButton}
                  />
                  <Button
                    title="Continue"
                    variant="destructive"
                    onPress={vm.handleDeleteConfirm}
                    style={styles.modalButton}
                  />
                </View>
              </>
            )}

            {vm.deleteStep === 'typing' && (
              <>
                <Typography variant="headline" weight="bold" align="center" color={colors.textPrimary}>
                  Confirm Deletion
                </Typography>
                <Typography
                  variant="body"
                  color={colors.textSecondary}
                  align="center"
                  style={styles.modalText}
                >
                  Type DELETE to confirm account deletion
                </Typography>

                <TextInput
                  style={deleteInputStyle}
                  placeholder="Type DELETE"
                  placeholderTextColor={colors.textTertiary}
                  value={vm.deleteInput}
                  onChangeText={vm.handleDeleteInputChange}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />

                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={vm.handleDeleteCancel}
                    style={styles.modalButton}
                  />
                  <Button
                    title="Delete Forever"
                    variant="destructive"
                    onPress={vm.handleDeleteFinal}
                    disabled={vm.deleteInput !== 'DELETE'}
                    style={styles.modalButton}
                  />
                </View>
              </>
            )}

            {vm.deleteStep === 'deleting' && (
              <>
                <Typography variant="headline" weight="bold" align="center" color={colors.textPrimary}>
                  Deleting Account...
                </Typography>
                <Typography
                  variant="body"
                  color={colors.textSecondary}
                  align="center"
                  style={styles.modalText}
                >
                  Please wait while we delete your data.
                </Typography>
                <ActivityIndicator color={colors.electricBlue} style={styles.modalSpinner} />
              </>
            )}
          </GlassContainer>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screen,
  },
  pageTitle: {
    marginBottom: spacing.md,
  },

  // Identity card
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  identityText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  proBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statLabel: {
    marginTop: spacing.xxs,
  },

  // Premium card
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.card,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  premiumInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  premiumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  premiumSub: {
    marginTop: spacing.xxs,
  },
  premiumButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
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

  // Actions
  actionsSection: {
    gap: spacing.sm,
  },
  version: {
    marginTop: spacing.xl,
  },

  // Delete modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
  },
  modalText: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
  modalSpinner: {
    marginTop: spacing.sm,
  },
  deleteInput: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.callout,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
