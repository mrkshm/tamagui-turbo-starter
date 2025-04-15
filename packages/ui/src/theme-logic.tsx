import { createContext, useContext, useState } from 'react'
import { TamaguiProvider, Theme } from 'tamagui'
import { config } from '@bbook/config'

// Get all theme names from Tamagui config
type ThemeName = keyof typeof config.themes

type ThemeContextType = {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

type ThemeProviderProps = {
  defaultTheme?: ThemeName
  children: React.ReactNode
}

// Context
const ThemeContext = createContext<ThemeContextType | null>(null)

// Main theme hook
export const useThemeSetting = () => {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useThemeSetting must be used within a ThemeProvider')
  }

  return {
    current: context.theme,
    toggle: () => {
      // For toggle we just handle light/dark
      context.setTheme(context.theme === 'light' ? 'dark' : 'light')
    },
    setTheme: context.setTheme  // Expose setTheme for direct theme changes
  }
}

// Provider component
export const ThemeProvider = ({ children, defaultTheme = 'light' }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <TamaguiProvider config={config}>
        <Theme name={theme}>
          {children}
        </Theme>
      </TamaguiProvider>
    </ThemeContext.Provider>
  )
}