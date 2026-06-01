import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ONBOARDING_FLOW, ONBOARDING_TOTAL } from '@/config/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { analyticsService } from '@/services/analyticsService';
import { appsFlyerService } from '@/services/appsFlyerService';
import { STEP_REGISTRY } from './steps';

/**
 * Onboarding flow controller.
 *
 * Walks the single ordered step list (src/config/onboarding/flow.ts). Each step
 * remounts on index change (keyed View) so per-step entrance animations replay.
 * Finishing persists the completion flag + name and hands off to Register.
 */
export function OnboardingFlowScreen() {
  const [index, setIndex] = useState(0);
  const finishing = useRef(false);
  const complete = useOnboardingStore((s) => s.complete);
  const reset = useOnboardingStore((s) => s.reset);

  const step = ONBOARDING_FLOW[index];

  useEffect(() => {
    analyticsService.trackScreen(`onboarding_${step.id}`, {
      screen_number: step.screen,
    });
  }, [step.id]);

  const handleComplete = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    try {
      await complete(); // persist flag + name (name kept for Register prefill)

      // Ask for App Tracking Transparency at the end of onboarding. AppsFlyer
      // was initialized with `timeToWaitForATTUserAuthorization`, so resolving
      // the prompt now lets the SDK attribute the install with IDFA (when the
      // user allows it) before that wait times out. Best-effort: the service
      // swallows its own errors and is a no-op off-iOS / in Expo Go, so it must
      // never block finishing onboarding.
      await appsFlyerService.requestTrackingPermission();
    } finally {
      reset(); // clear in-memory answers; persisted name survives
      router.replace('/(auth)/register');
    }
  }, [complete, reset]);

  const handleNext = useCallback(() => {
    setIndex((prev) => {
      if (prev >= ONBOARDING_TOTAL - 1) {
        handleComplete();
        return prev;
      }
      return prev + 1;
    });
  }, [handleComplete]);

  const StepComponent = STEP_REGISTRY[step.type];

  return (
    <View style={styles.container}>
      <View key={step.id} style={styles.flex}>
        <StepComponent
          step={step}
          onNext={handleNext}
          onComplete={handleComplete}
          index={index}
          total={ONBOARDING_TOTAL}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  flex: {
    flex: 1,
  },
});
