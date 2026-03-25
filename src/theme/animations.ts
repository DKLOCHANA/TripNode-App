export const springs = {
  gentle: { damping: 20, stiffness: 180 },
  snappy: { damping: 16, stiffness: 300 },
  bouncy: { damping: 12, stiffness: 250 },
} as const;

export const durations = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;
