import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { GlassContainer } from '@/presentation/components/ui/GlassContainer';
import { Button } from '@/presentation/components/ui/Button';
import { useProfileViewModel } from '@/presentation/view-models/useProfileViewModel';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import { typography } from '@/theme/typography';
import { shadows } from '@/theme/shadows';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const vm = useProfileViewModel();
  const { colors, isDark, toggleTheme } = useTheme();

  const logoutButtonStyle = {
    backgroundColor: isDark ? colors.backgroundSecondary : colors.white,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    ...shadows.md,
  };

  const deleteButtonStyle = {
    backgroundColor: isDark ? colors.backgroundSecondary : colors.white,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    ...shadows.md,
  };

  const scrollContentStyle = [
    styles.scrollContent,
    { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxxl },
  ];

  const containerStyle = [styles.container, { backgroundColor: colors.backgroundPrimary }];

  const avatarStyle = [styles.avatar, { borderColor: colors.electricBlue }];

  const avatarFallbackStyle = [
    styles.avatarFallback,
    { backgroundColor: colors.electricBlueDim, borderColor: colors.electricBlue },
  ];

  const avatarBadgeStyle = [
    styles.avatarBadge,
    { backgroundColor: colors.electricBlue, borderColor: colors.backgroundPrimary },
  ];

  const proBadgeStyle = [
    styles.proBadge,
    { backgroundColor: colors.electricBlueDim, borderColor: colors.electricBlue },
  ];

  const rowDividerStyle = [styles.rowDivider, { backgroundColor: colors.glassBorder }];

  const deleteInputStyle = [
    styles.deleteInput,
    {
      backgroundColor: colors.glassInputBg,
      borderColor: colors.glassBorder,
      color: colors.textPrimary,
    },
  ];

  return (
    <View style={containerStyle}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Pressable style={styles.avatarContainer} onPress={vm.handleAvatarPress}>
            {vm.userPhotoURL ? (
              <Image
                source={{ uri: vm.userPhotoURL }}
                style={avatarStyle}
                contentFit="cover"
                cachePolicy="disk"
              />
            ) : (
              <View style={avatarFallbackStyle}>
                <Typography variant="title1" weight="bold" color={colors.electricBlue}>
                  {vm.userInitials}
                </Typography>
              </View>
            )}
            <View style={avatarBadgeStyle}>
              <Ionicons
                name={vm.hasLocalPhoto ? 'pencil' : 'camera'}
                size={14}
                color={colors.white}
              />
            </View>
          </Pressable>

          <Typography variant="title2" weight="bold" style={styles.userName} color={colors.textPrimary}>
            {vm.userName}
          </Typography>
          <Typography variant="footnote" color={colors.textSecondary}>
            {vm.userEmail}
          </Typography>

          {vm.subscriptionTier === 'pro' && (
            <View style={proBadgeStyle}>
              <Typography variant="caption2" weight="bold" color={colors.electricBlue}>
                PRO
              </Typography>
            </View>
          )}
        </View>

        {/* Subscription Section */}
        <GlassContainer style={styles.section}>
          <Typography variant="caption1" weight="semiBold" color={colors.textSecondary} style={styles.sectionTitle}>
            SUBSCRIPTION
          </Typography>

          <View style={styles.subscriptionRow}>
            <View style={styles.subscriptionInfo}>
              <Typography variant="body" weight="semiBold" color={colors.textPrimary}>
                {vm.isPro ? 'TripNode Premium' : vm.isExpired ? 'Subscription Expired' : 'Free Plan'}
              </Typography>
              {vm.subscriptionExpiry && vm.isPro && (
                <Typography variant="caption1" color={colors.textSecondary}>
                  {vm.renewsAutomatically ? 'Renews' : 'Expires'} {vm.subscriptionExpiry}
                </Typography>
              )}
              {vm.isExpired && (
                <Typography variant="caption1" color={colors.error}>
                  Expired {vm.subscriptionExpiry}
                </Typography>
              )}
            </View>

            {vm.isPro ? (
              <Button
                title="Manage"
                variant="secondary"
                size="small"
                onPress={vm.handleManageSubscription}
              />
            ) : (
              <Button
                title={vm.isExpired ? 'Renew' : 'Upgrade'}
                variant="primary"
                size="small"
                onPress={vm.handleUpgradeToPro}
              />
            )}
          </View>
        </GlassContainer>

        {/* Appearance Section */}
        <GlassContainer style={styles.section}>
          <Typography variant="caption1" weight="semiBold" color={colors.textSecondary} style={styles.sectionTitle}>
            APPEARANCE
          </Typography>

          <View style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={20}
                color={colors.electricBlue}
                style={styles.settingsIcon}
              />
              <Typography variant="body" color={colors.textPrimary}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Typography>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#0A84FF' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#767577"
            />
          </View>
        </GlassContainer>

        {/* Information Section */}
        <GlassContainer style={styles.section}>
          <Typography variant="caption1" weight="semiBold" color={colors.textSecondary} style={styles.sectionTitle}>
            INFORMATION
          </Typography>

          <Pressable style={styles.settingsRow} onPress={vm.handlePrivacyPolicy}>
            <Typography variant="body" color={colors.textPrimary}>Privacy Policy</Typography>
            <Typography variant="body" color={colors.electricBlue}>→</Typography>
          </Pressable>

          <View style={rowDividerStyle} />

          <Pressable style={styles.settingsRow} onPress={vm.handleTermsOfService}>
            <Typography variant="body" color={colors.textPrimary}>Terms of Service</Typography>
            <Typography variant="body" color={colors.electricBlue}>→</Typography>
          </Pressable>
        </GlassContainer>

        {/* Account Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Log Out"
            variant="ghost"
            onPress={vm.handleLogout}
            loading={vm.isLoggingOut}
            style={logoutButtonStyle}
          />

          <Button
            title="Delete Account"
            variant="destructive"
            onPress={vm.handleDeletePress}
            style={deleteButtonStyle}
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
              </>
            )}
          </GlassContainer>
        </View>
      </Modal>
    </View>
  );
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  userName: {
    marginBottom: spacing.xxs,
  },
  proBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: spacing.sm,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
  },
  actionsSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  logoutButton: {
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  deleteButton: {
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  version: {
    marginTop: spacing.xl,
  },
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