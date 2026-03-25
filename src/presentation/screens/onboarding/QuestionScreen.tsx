import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '@/presentation/components/ui/Typography';
import { SelectableOption } from '@/presentation/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface QuestionScreenProps {
  question: string;
  options: readonly string[];
  nextRoute: string;
  storeKey: 'selectedAnswer1' | 'selectedAnswer2' | 'selectedAnswer3';
}

export function QuestionScreen({ question, options, nextRoute, storeKey }: QuestionScreenProps) {
  const insets = useSafeAreaInsets();
  const store = useOnboardingStore();
  
  const setterKey = storeKey.replace('selected', 'set') as 'setAnswer1' | 'setAnswer2' | 'setAnswer3';
  const currentValue = store[storeKey];
  const setAnswer = store[setterKey];
  
  const [localSelected, setLocalSelected] = useState<string | null>(currentValue);

  const questionOpacity = useRef(new Animated.Value(0)).current;
  const questionTranslateY = useRef(new Animated.Value(20)).current;
  const optionAnimations = useRef(options.map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
  }))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(questionOpacity, {
        toValue: 1,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(questionTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    optionAnimations.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 500,
          delay: 200 + index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 500,
          delay: 200 + index * 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handleSelect = (answer: string) => {
    setLocalSelected(answer);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (setAnswer as (a: any) => void)(answer);
    
    setTimeout(() => {
      router.push(nextRoute as any);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...gradients.onboarding]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}>
        <Animated.View style={{ opacity: questionOpacity, transform: [{ translateY: questionTranslateY }] }}>
          <Typography
            variant="title1"
            weight="bold"
            align="center"
            style={styles.question}
          >
            {question}
          </Typography>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <Animated.View
              key={option}
              style={{
                opacity: optionAnimations[index].opacity,
                transform: [{ translateY: optionAnimations[index].translateY }],
              }}
            >
              <SelectableOption
                text={option}
                isSelected={localSelected === option}
                onSelect={() => handleSelect(option)}
                style={styles.option}
              />
            </Animated.View>
          ))}
        </View>
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
    justifyContent: 'center',
  },
  question: {
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.md,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    width: '100%',
  },
});
