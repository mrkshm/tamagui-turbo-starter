import React from 'react';
import { Select, Text, XStack, Adapt, Sheet, YStack } from '@bbook/ui';
import { themes } from '@bbook/config';
import { useThemeStore, ThemeKey } from '@bbook/stores/src/themeStore';

export interface ThemeSwitcherProps {
  label?: string;
}

type ThemeName = keyof typeof themes;

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  label = 'Theme',
}) => {
  const theme = useThemeStore((s: { theme: string }) => s.theme) as ThemeName;
  const setTheme = useThemeStore((s: { setTheme: (theme: string) => void }) => s.setTheme);
  // Get theme options from the themes object
  const themeOptions = React.useMemo(() => {
    if (!themes || typeof themes !== 'object') return [];
    return Object.entries(themes).map(([key, theme]) => ({
      key,
      label: theme.displayName || key,
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
      <Select value={theme} onValueChange={(val) => setTheme(val as ThemeKey)}>
        <Select.Trigger>
          <Select.Value color="$textPrimary" placeholder="Select theme..." />
        </Select.Trigger>
        <Adapt when="maxMd" platform="touch">
          <Sheet snapPoints={[25, 100]} modal dismissOnSnapToBottom>
            <Sheet.Frame padding="$4">
              <Adapt.Contents />
            </Sheet.Frame>
            <Sheet.Overlay opacity={0.3} />
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
};
