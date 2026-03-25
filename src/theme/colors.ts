// Dark theme colors (default)
export const darkColors = {
  // Brand
  electricBlue: '#0A84FF',
  electricBlueDim: 'rgba(10,132,255,0.15)',
  electricBluePressed: '#0070E0',

  // Backgrounds — OLED optimised
  backgroundPrimary: '#000000',
  backgroundSecondary: '#0C0C0E',
  backgroundTertiary: '#1C1C1E',

  // Glass surfaces
  glassSurface: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassHighlight: 'rgba(255,255,255,0.04)',
  glassInputBg: 'rgba(255,255,255,0.06)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.60)',
  textTertiary: 'rgba(255,255,255,0.35)',
  textDisabled: 'rgba(255,255,255,0.20)',
  textLink: '#0A84FF',

  // Semantic
  success: '#30D158',
  successDim: 'rgba(48,209,88,0.15)',
  warning: '#FFD60A',
  error: '#FF453A',
  errorDim: 'rgba(255,69,58,0.15)',

  // Tab bar
  tabBarBackground: 'rgba(0,0,0,0.85)',
  tabBarBorder: 'rgba(255,255,255,0.08)',
  tabBarActive: '#0A84FF',
  tabBarInactive: 'rgba(255,255,255,0.35)',

  // Social buttons
  appleBtnBg: '#000000',
  appleBtnBorder: 'rgba(255,255,255,0.20)',
  googleBtnBg: '#FFFFFF',
  googleBtnText: '#1F1F1F',
  googleBtnBlue: '#4285F4',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Light theme colors
export const lightColors = {
  // Brand (unchanged)
  electricBlue: '#0A84FF',
  electricBlueDim: 'rgba(10,132,255,0.15)',
  electricBluePressed: '#0070E0',

  // Backgrounds — Light mode
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundTertiary: '#E5E5EA',

  // Glass surfaces (adjusted for light mode)
  glassSurface: 'rgba(0,0,0,0.04)',
  glassBorder: 'rgba(0,0,0,0.08)',
  glassHighlight: 'rgba(0,0,0,0.02)',
  glassInputBg: 'rgba(0,0,0,0.04)',

  // Text
  textPrimary: '#000000',
  textSecondary: 'rgba(0,0,0,0.60)',
  textTertiary: 'rgba(0,0,0,0.35)',
  textDisabled: 'rgba(0,0,0,0.20)',
  textLink: '#0A84FF',

  // Semantic (unchanged)
  success: '#30D158',
  successDim: 'rgba(48,209,88,0.15)',
  warning: '#FFD60A',
  error: '#FF453A',
  errorDim: 'rgba(255,69,58,0.15)',

  // Tab bar
  tabBarBackground: 'rgba(255,255,255,0.85)',
  tabBarBorder: 'rgba(0,0,0,0.08)',
  tabBarActive: '#0A84FF',
  tabBarInactive: 'rgba(0,0,0,0.35)',

  // Social buttons
  appleBtnBg: '#000000',
  appleBtnBorder: 'rgba(0,0,0,0.20)',
  googleBtnBg: '#FFFFFF',
  googleBtnText: '#1F1F1F',
  googleBtnBlue: '#4285F4',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Default export for backward compatibility
export const colors = darkColors;

// Gradient presets for consistent usage
export const gradients = {
  onboarding: ['#0a1628', '#0f1f3d', '#000'] as const,
  authLogin: ['#1a1a2e', '#16213e', '#0f3460', '#000'] as const,
  authRegister: ['#2d1b69', '#1a1a2e', '#0f3460', '#e94560'] as const,
} as const;
