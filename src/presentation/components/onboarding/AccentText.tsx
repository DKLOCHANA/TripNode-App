import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { onboardingTokens } from './tokens';

interface AccentTextProps {
  /** Text where words wrapped in *asterisks* are rendered in the accent color. */
  children: string;
  style?: StyleProp<TextStyle>;
  accentColor?: string;
  numberOfLines?: number;
}

/**
 * Splits a string on `*accent*` markers and renders the marked spans in the
 * onboarding accent color. Everything else inherits `style`.
 */
export function AccentText({
  children,
  style,
  accentColor = onboardingTokens.accent,
  numberOfLines,
}: AccentTextProps) {
  const parts = children.split(/(\*[^*]+\*)/g).filter(Boolean);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, i) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <Text key={i} style={{ color: accentColor }}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}
