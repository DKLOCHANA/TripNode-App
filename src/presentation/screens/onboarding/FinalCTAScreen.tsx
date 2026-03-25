import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { Button } from '@/presentation/components/ui/Button';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const ctaFeatures = [
  { icon: 'sparkles-outline', label: 'AI-built itineraries in seconds' },
  { icon: 'map-outline', label: 'Day-by-day routes that make sense' },
  { icon: 'wallet-outline', label: 'Recommendations matched to your budget' },
] as const;

export function FinalCTAScreen() {
  const insets = useSafeAreaInsets();
  const { reset } = useOnboardingStore();
  
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineTranslateY = useRef(new Animated.Value(20)).current;
  const supportingOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Headline animation
    Animated.parallel([
      Animated.timing(headlineOpacity, { toValue: 1, duration: 700, delay: 200, useNativeDriver: true }),
      Animated.timing(headlineTranslateY, { toValue: 0, duration: 700, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Supporting text animation
    Animated.timing(supportingOpacity, { toValue: 1, duration: 600, delay: 500, useNativeDriver: true }).start();

    // Button animation
    Animated.parallel([
      Animated.timing(buttonOpacity, { toValue: 1, duration: 600, delay: 800, useNativeDriver: true }),
      Animated.timing(buttonTranslateY, { toValue: 0, duration: 600, delay: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLetsTravel = () => {
    // Reset onboarding state
    reset();
    // Navigate to register screen
    router.replace('/(auth)/register');
  };

  return (
    <View style={styles.container}>
      {/* Gradient overlay for readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.centerSection}>
          {/* Headline */}
          <Animated.View style={{ opacity: headlineOpacity, transform: [{ translateY: headlineTranslateY }] }}>
            <Typography
              variant="largeTitle"
              weight="heavy"
              align="center"
              style={styles.headline}
            >
              Your smarter travel planning starts now
            </Typography>
          </Animated.View>

          

            <View style={styles.featuresList}>
              {ctaFeatures.map((feature) => (
                <View key={feature.label} style={styles.featureRow}>
                  <Ionicons name={feature.icon} size={16} color={colors.textSecondary} />
                  <Typography variant="body" color={colors.textSecondary} style={styles.featureText}>
                    {feature.label}
                  </Typography>
                </View>
              ))}
            </View>
       
        </View>

        {/* CTA Button */}
        <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslateY }] }]}>
          <Button
            title="CREATE MY PLAN"
            onPress={handleLetsTravel}
            size="large"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screen,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
 
  featuresList: {
    marginTop: spacing.lg,
    rowGap: spacing.sm,
    width: '100%',
    
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    marginLeft: spacing.sm,
  },
  buttonContainer: {
    paddingTop: spacing.xl,
  },
});
