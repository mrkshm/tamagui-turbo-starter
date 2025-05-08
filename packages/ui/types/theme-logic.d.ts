import { config } from './config';
type ThemeName = keyof typeof config.themes;
type ThemeContextType = {
    theme: ThemeName;
    setTheme?: (theme: ThemeName) => void;
};
type ThemeProviderProps = {
    children: React.ReactNode;
};
declare const ThemeContext: import("react").Context<ThemeContextType>;
export declare const ThemeProvider: ({ children }: ThemeProviderProps) => import("react/jsx-runtime").JSX.Element;
export { ThemeContext };
//# sourceMappingURL=theme-logic.d.ts.map