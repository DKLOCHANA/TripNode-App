import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Animated, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/presentation/components/ui/Typography';
import { radii } from '@/theme/radii';
import { onboardingTokens, f, ms } from './tokens';

interface ChoiceOptionProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
  /** 'list' = full-width row, 'chips' = compact wrapping pill. */
  layout: 'list' | 'chips';
}

export function ChoiceOption({
  label,
  emoji,
  selected,
  onPress,
  layout,
}: ChoiceOptionProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(glow, {
      toValue: selected ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isChip = layout === 'chips';

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
        }
        style={[
          isChip ? styles.chip : styles.row,
          {
            backgroundColor: selected
              ? onboardingTokens.cardBgSelected
              : onboardingTokens.cardBg,
            borderColor: selected
              ? onboardingTokens.accent
              : onboardingTokens.cardBorder,
            borderWidth: selected ? 1.5 : 1,
          },
        ]}
      >
        <View style={isChip ? styles.chipInner : styles.rowInner}>
          {emoji ? (
            <Typography
              variant={isChip ? 'footnote' : 'callout'}
              style={{ fontSize: isChip ? f(13) : f(17) }}
            >
              {emoji}
            </Typography>
          ) : null}
          <Typography
            variant={isChip ? 'footnote' : 'callout'}
            weight={selected ? 'semiBold' : 'medium'}
            color={
              selected ? onboardingTokens.textPrimary : onboardingTokens.textSecondary
            }
            style={{
              fontSize: isChip ? f(13) : f(15),
              flexShrink: 1,
            }}
          >
            {label}
          </Typography>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: radii.md,
    paddingVertical: ms(14),
    paddingHorizontal: ms(16),
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
  },
  chip: {
    borderRadius: radii.full,
    paddingVertical: ms(9),
    paddingHorizontal: ms(14),
  },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
  },
});
