import { themes as defaultThemes } from '@tamagui/themes';
import { tokens } from './tokens';

export const themes = {
  light: {
    ...defaultThemes.light,
    displayName: 'Light',
    // COLORS
    background: tokens.color['background.100'],
    surface: tokens.color['neutral.100'],
    textPrimary: tokens.color['typography.950'],
    textSecondary: tokens.color['typography.700'],
    primary: tokens.color['primary.500'],
    onPrimary: tokens.color['primary.50'],
    secondary: tokens.color['secondary.500'],
    onSecondary: tokens.color['secondary.50'],
    accent: tokens.color['accent.500'],
    success: tokens.color['success.500'],
    error: tokens.color['error.500'],
    outline: tokens.color['outline.50'],
    info: tokens.color['info.500'],
    warning: tokens.color['warning.500'],
  },
  dark: {
    ...defaultThemes.dark,
    displayName: 'Dark',
    // COLORS
    background: tokens.color['background.950'],
    surface: tokens.color['neutral.950'],
    textPrimary: tokens.color['typography.50'],
    textSecondary: tokens.color['typography.400'],
    primary: tokens.color['primary.500'],
    onPrimary: tokens.color['primary.50'],
    secondary: tokens.color['secondary.500'],
    onSecondary: tokens.color['secondary.50'],
    accent: tokens.color['accent.500'],
    success: tokens.color['success.500'],
    error: tokens.color['error.500'],
    outline: tokens.color['outline.50'],
    info: tokens.color['info.500'],
    warning: tokens.color['warning.500'],
  },
};
