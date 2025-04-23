import { createContext } from 'react';
import { TamaguiProvider, Theme } from 'tamagui';
import { config } from '@bbook/config';
import { useSnapshot } from 'valtio';
import { userStore } from '@bbook/stores/src/userStore';

type ThemeName = keyof typeof config.themes;
type ThemeContextType = {
  theme: ThemeName;
  setTheme?: (theme: ThemeName) => void;
};
type ThemeProviderProps = { children: React.ReactNode };

const ThemeContext = createContext<ThemeContextType>({ theme: 'light' });

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const snap = useSnapshot(userStore);
  const theme = snap.theme as ThemeName;

  const setTheme = (theme: ThemeName) => {
    userStore.theme = theme;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <TamaguiProvider config={config}>
        <Theme name={theme}>{children}</Theme>
      </TamaguiProvider>
    </ThemeContext.Provider>
  );
};
