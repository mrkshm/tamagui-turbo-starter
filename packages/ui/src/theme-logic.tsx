import { createContext } from 'react';
import { TamaguiProvider, Theme } from 'tamagui';
import { config } from './config';
import { useThemeStore, type ThemeKey } from '@bbook/stores/src/themeStore';

// Types

// ThemeName should match your config theme keys
type ThemeName = keyof typeof config.themes;
type ThemeContextType = {
  theme: ThemeName;
  setTheme?: (theme: ThemeName) => void;
};
type ThemeProviderProps = { children: React.ReactNode };

const ThemeContext = createContext<ThemeContextType>({ theme: 'light' });

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const theme = useThemeStore((s: { theme: ThemeKey }) => s.theme);
  const setThemeStore = useThemeStore(
    (s: { setTheme: (theme: ThemeKey) => void }) => s.setTheme
  );
  const setTheme = (t: ThemeName) => setThemeStore(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <TamaguiProvider config={config}>
        <Theme name={theme}>{children}</Theme>
      </TamaguiProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
