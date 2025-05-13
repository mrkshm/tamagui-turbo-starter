import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';
import { bodyFont, headingFont } from './fonts';
import { animations } from './animations';
import { themes } from './themes';
import { tokens } from './tokens';
import { media, mediaQueryDefaultActive } from './token_defs/media';

export const config = createTamagui({
  ...defaultConfig,
  animations,
  mediaQueryDefaultActive,
  media,
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
  texts: {
    H1: {
      fontFamily: '$heading',
      fontSize: '$7',
      letterSpacing: -0.5,
      fontWeight: '700',
    },
    H2: {
      fontFamily: '$heading',
      fontSize: '$6',
      letterSpacing: -0.5,
      fontWeight: '700',
    },
    H3: {
      fontFamily: '$heading',
      fontSize: '$5',
      letterSpacing: -0.5,
      fontWeight: '700',
    },
    defaultProps: {
      size: '$3',
      lineHeight: '$2',
    },
  },
  // Set default component sizes
  defaultProps: {
    Button: {
      size: '$4',
      height: '$true',
    },
    Input: {
      size: '$4',
      height: '$true',
    },
    XStack: {
      height: 'auto',
    },
    YStack: {
      height: 'auto',
    },
  },
  settings: {
    themeClassNameOnRoot: true,
  },
  tokens,
  themes,
  defaultTheme: 'light',
});
