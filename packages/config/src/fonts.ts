import { createInterFont } from '@tamagui/font-inter';
import { createFont } from 'tamagui';

export const headingFont = createFont({
  family: 'Jura',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 24,
    5: 32,
    6: 40,
    7: 48,
  },
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
});

export const bodyFont = createInterFont(
  {
    face: {
      700: { normal: 'InterBold' },
    },
  },
  {
    sizeSize: (size) => Math.round(size * 1.1),
    sizeLineHeight: (size) => Math.round(size * 1.1 + (size > 20 ? 10 : 10)),
  }
);
