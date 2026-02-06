/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#2563eb'; // Mikodem primary - blue
const tintColorDark = '#60a5fa';

/** Mikodem dark theme - used across all app screens */
export const DarkTheme = {
  background: '#0a0a0f',
  surface: '#15151f',
  surfaceLight: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#666',
  border: 'rgba(255,255,255,0.1)',
};

export const Colors = {
  light: {
    text: '#ffffff',
    background: DarkTheme.background,
    tint: tintColorLight,
    icon: '#a0a0a0',
    tabIconDefault: '#666',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: DarkTheme.background,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
