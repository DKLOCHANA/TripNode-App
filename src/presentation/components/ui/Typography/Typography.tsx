import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { typography } from '@/theme/typography';

type Variant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subheadline'
  | 'footnote'
  | 'caption1'
  | 'caption2';

type Weight = keyof typeof typography.fontWeight;

interface TypographyProps {
  variant?: Variant;
  color?: string;
  weight?: Weight;
  align?: TextStyle['textAlign'];
  numberOfLines?: number;
  children: React.ReactNode;
  style?: TextStyle;
}

export function Typography({
  variant = 'body',
  color,
  weight,
  align,
  numberOfLines,
  children,
  style,
}: TypographyProps) {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.textPrimary;

  const defaultWeight =
    variant === 'headline' || variant.startsWith('title') || variant === 'largeTitle'
      ? 'bold'
      : 'regular';

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontSize: typography.fontSize[variant],
          lineHeight: typography.lineHeight[variant],
          fontWeight: typography.fontWeight[weight ?? defaultWeight],
          color: resolvedColor,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
