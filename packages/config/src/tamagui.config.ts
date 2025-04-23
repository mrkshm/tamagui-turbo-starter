import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';
import { bodyFont, headingFont } from './fonts';
import { animations } from './animations';
import { themes } from './themes';
import { tokens } from './tokens';

export const config = createTamagui({
  ...defaultConfig,
  animations,
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
  texts: {
    H1: {
      fontFamily: '$heading',
      fontSize: '$6',
      letterSpacing: -0.5,
      fontWeight: '700',
    },
    defaultProps: {
      size: '$3',
      lineHeight: '$2',
    },
  },
  settings: {
    themeClassNameOnRoot: true,
  },
  tokens,
  themes,
  defaultTheme: 'light',
});
