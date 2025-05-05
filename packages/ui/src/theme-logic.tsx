import { createContext } from 'react';
import { TamaguiProvider, Theme } from 'tamagui';
import { config } from '@bbook/config';
import { useThemeStore } from '@bbook/stores/src/themeStore';

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
  // Cast theme for type safety
  const theme = useThemeStore((s: { theme: string }) => s.theme) as ThemeName;
  const setThemeStore = useThemeStore((s: { setTheme: (theme: string) => void }) => s.setTheme);
  // Wrap setTheme to enforce ThemeName type
  const setTheme = (t: ThemeName) => setThemeStore(String(t));

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <TamaguiProvider config={config}>
        <Theme name={theme}>{children}</Theme>
      </TamaguiProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
