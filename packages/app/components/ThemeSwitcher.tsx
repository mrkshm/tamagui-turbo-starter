import React from 'react';
import { Select, Text, XStack, Adapt, Sheet, YStack, themes } from '@bbook/ui';
import { useThemeStore, ThemeKey } from '@bbook/stores';
import { useThemeSync } from '@bbook/stores';
import { useTranslation } from '@bbook/i18n';

export interface ThemeSwitcherProps {
  label?: string;
}

type ThemeName = keyof typeof themes;

// Create a separate component for the theme switcher UI
// This prevents the useThemeSync hook from being called on every keystroke
const ThemeSwitcherUI = React.memo(
  ({
    label,
    theme,
    setTheme,
  }: {
    label: string;
    theme: ThemeKey;
    setTheme: (theme: ThemeKey) => void;
  }) => {
    const { t } = useTranslation();
    // Get theme options from the themes object
    const themeOptions = React.useMemo(() => {
      if (!themes || typeof themes !== 'object') return [];
      return Object.entries(themes).map(([key, theme]) => ({
        key,
        label: t(`common:theme.${key}`),
      }));
    }, []);

    return (
      <XStack
        flexDirection="column"
        gap="$2"
        backgroundColor="$background"
        $platform-web={{ width: 'fit-content' }}
      >
        <Text fontWeight="bold" marginBottom="$2">
          {label}
        </Text>
        <Select
          value={theme}
          onValueChange={(val) => setTheme(val as ThemeKey)}
        >
          <Select.Trigger>
            <Select.Value color="$textPrimary" placeholder="Select theme..." />
          </Select.Trigger>
          <Adapt when="sm" platform="touch">
            <Sheet snapPoints={[25, 100]} modal dismissOnSnapToBottom>
              <Sheet.Frame padding="$4">
                <Sheet.ScrollView>
                  <Adapt.Contents />
                </Sheet.ScrollView>
              </Sheet.Frame>
              <Sheet.Overlay
                backgroundColor="$background"
                opacity={0.5}
                backgroundBlendMode="difference"
              />
            </Sheet>
          </Adapt>
          <Select.Content>
            <Select.ScrollUpButton />
            <Select.Viewport paddingVertical="$4">
              <YStack gap="$1" width="100%">
                {themeOptions.map((option, i) => (
                  <Select.Item
                    key={option.key}
                    value={option.key}
                    index={i}
                    backgroundColor={
                      theme === option.key
                        ? (themes[option.key as ThemeName]?.primary ??
                          '$backgroundStrong')
                        : '$backgroundStrong'
                    }
                    borderRadius={16}
                    paddingVertical={16}
                    paddingHorizontal={20}
                    marginBottom="$2"
                    width="auto"
                    pressStyle={{ backgroundColor: '$backgroundFocus' }}
                    focusStyle={{ backgroundColor: '$backgroundFocus' }}
                    $platform-web={{ paddingVertical: 8 }}
                  >
                    <Select.ItemText
                      fontSize={18}
                      textAlign="center"
                      fontWeight="600"
                      color={
                        theme === option.key
                          ? (themes[option.key as ThemeName]?.onPrimary ??
                            '$color')
                          : '$color'
                      }
                    >
                      {option.label}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </YStack>
            </Select.Viewport>
            <Select.ScrollDownButton />
          </Select.Content>
        </Select>
      </XStack>
    );
  }
);

// This component initializes theme sync without re-rendering on keystrokes
const ThemeSyncInitializer = React.memo(() => {
  // Initialize the theme sync with backend
  // This is necessary, do not delete it even if linter complains
  useThemeSync();
  return null;
});

// This is the main component that handles the theme sync
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = (props) => {
  const { t } = useTranslation();
  const theme = useThemeStore((s: { theme: ThemeKey }) => s.theme);
  const setTheme = useThemeStore(
    (s: { setTheme: (theme: ThemeKey) => void }) => s.setTheme
  );

  // For debugging purposes
  React.useEffect(() => {
    console.log('ThemeSwitcher mounted, current theme:', theme);
  }, [theme]);

  return (
    <>
      {/* This component only renders once and won't re-render on keystrokes */}
      <ThemeSyncInitializer />

      {/* UI component is memoized to prevent re-renders */}
      <ThemeSwitcherUI
        label={props.label || t('common:theme.label')}
        theme={theme}
        setTheme={setTheme}
      />
    </>
  );
};
