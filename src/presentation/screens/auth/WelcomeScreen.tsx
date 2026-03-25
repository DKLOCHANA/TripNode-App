import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, Redirect } from 'expo-router';
import { colors } from '@/theme/colors';

/**
 * WelcomeScreen now redirects to the onboarding flow.
 * The actual welcome/splash experience is in the onboarding/index screen.
 */
export function WelcomeScreen() {
  return <Redirect href="/(auth)/onboarding" />;
}


