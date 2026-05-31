import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors } from '@/theme/colors';

/**
 * Entry gate for unauthenticated users.
 *
 * Decides — based on the persisted completion flag — whether to show the full
 * onboarding flow (first time) or skip straight to Register (returning users).
 */
export function WelcomeScreen() {
  const { isHydrated, completed, hydrate } = useOnboardingStore();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);

  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.electricBlue} />
      </View>
    );
  }

  return (
    <Redirect href={completed ? '/(auth)/register' : '/(auth)/onboarding'} />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
});
