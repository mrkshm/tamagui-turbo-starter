import { createInterFont } from '@tamagui/font-inter';
import { createFont } from 'tamagui';
import { fontSize } from './token_defs/font_size';

export const headingFont = createFont({
  family: 'Jura',
  size: fontSize,
  weight: {
    4: '400',
    5: '700',
  },
  letterSpacing: {
    2: -0.5,
    3: -0.25,
    4: 0,
    5: 0.25,
  },
  sizeLineHeight: (fontSize: number) => fontSize + 4,
});

export const bodyFont = createInterFont(
  {
    size: fontSize,
    face: {
      700: { normal: 'InterBold' },
    },
  },
  {
    sizeLineHeight: (size) => Math.round(size * 1.1 + (size > 20 ? 10 : 10)),
  }
);
