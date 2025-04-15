import { defaultConfig } from '@tamagui/config/v4'
import { createTamagui } from 'tamagui'
import { bodyFont, headingFont } from './fonts'
import { animations } from './animations'
import { themes } from './themes'
import { tokens } from './tokens'

export const config = createTamagui({
  ...defaultConfig,
  animations,
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
  settings: {
    themeClassNameOnRoot: true
  },
  tokens,
  themes,
  defaultTheme: 'light'
})
