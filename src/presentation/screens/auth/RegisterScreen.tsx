import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeScrollView } from '@/presentation/components/shared/SafeScrollView';
import { ErrorBanner } from '@/presentation/components/shared/ErrorBanner';
import { Typography } from '@/presentation/components/ui/Typography';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { AppleSignInButton } from '@/presentation/components/auth/AppleSignInButton';
import { AuthFormDivider } from '@/presentation/components/auth/AuthFormDivider';
import { useRegisterViewModel } from '@/presentation/view-models/useRegisterViewModel';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const {
    name,
    email,
    password,
    confirmPassword,
    fieldErrors,
    loading,
    authError,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleCreateAccount,
    handleAppleSignIn,
    clearError,
    navigateToLogin,
  } = useRegisterViewModel();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...gradients.authRegister]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.bgGradient}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
        style={StyleSheet.absoluteFill}
      />

      <SafeScrollView
        contentContainerStyle={{ 
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: spacing.xxl,
        }}
      >
        {/* App Icon */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="navigate" size={24} color={colors.white} />
          </View>
        </View>

        {/* Header */}
        <Typography variant="title1" weight="bold" align="center">
          Create your account
        </Typography>
        <Typography
          variant="subheadline"
          color={colors.textSecondary}
          align="center"
          style={styles.subtitle}
        >
          Start your next journey today.
        </Typography>

        {/* Auth error banner */}
        {authError && (
          <ErrorBanner
            error={authError}
            onDismiss={clearError}
            onRetry={handleCreateAccount}
          />
        )}

        {/* Form inputs */}
        <View style={styles.form}>
          <Input
            placeholder="Name"
            value={name}
            onChangeText={setName}
            error={fieldErrors.name}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
          />

          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            error={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            error={fieldErrors.password}
            secureTextEntry
            autoComplete="new-password"
            returnKeyType="next"
          />

          <Input
            placeholder="Verify Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={fieldErrors.confirmPassword}
            secureTextEntry
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={handleCreateAccount}
          />
        </View>

        {/* CTA */}
        <Button
          title="Create Account"
          variant="primary"
          size="large"
          loading={loading}
          onPress={handleCreateAccount}
          style={styles.cta}
        />

        {/* Divider */}
        <AuthFormDivider />

        {/* Social auth */}
        <AppleSignInButton onPress={handleAppleSignIn} />

        {/* Footer link */}
        <View style={styles.footerRow}>
          <Typography variant="footnote" color={colors.textTertiary}>
            Already have an account?{' '}
          </Typography>
          <Pressable onPress={navigateToLogin}>
            <Typography
              variant="footnote"
              color={colors.textLink}
              weight="semiBold"
            >
              Log in
            </Typography>
          </Pressable>
        </View>
      </SafeScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    height: SCREEN_HEIGHT,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.electricBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: spacing.xxs,
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.md,
    width: '100%',
  },
  cta: {
    marginTop: spacing.md,
    width: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    width: '100%',
  },
});
