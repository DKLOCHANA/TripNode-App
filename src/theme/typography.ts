import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  default: 'System',
});

export const typography = {
  fontFamily,
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  fontSize: {
    largeTitle: 34,
    title1: 28,
    title2: 22,
    title3: 20,
    headline: 17,
    body: 17,
    callout: 16,
    subheadline: 15,
    footnote: 13,
    caption1: 12,
    caption2: 11,
  },
  lineHeight: {
    largeTitle: 41,
    title1: 34,
    title2: 28,
    title3: 25,
    headline: 22,
    body: 22,
    callout: 21,
    subheadline: 20,
    footnote: 18,
    caption1: 16,
    caption2: 13,
  },
} as const;
