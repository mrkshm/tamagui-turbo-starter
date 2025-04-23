import React from 'react';
import { Select, Text, XStack, Adapt, Sheet, YStack } from 'tamagui';
import { themes } from '@bbook/config';
import { userStore, ThemeKey } from '@bbook/stores/src/userStore';
import { useSnapshot } from 'valtio';

export interface ThemeSwitcherProps {
  label?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  label = 'Theme',
}) => {
  const snap = useSnapshot(userStore);
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
      <Select
        value={snap.theme}
        onValueChange={(val) => {
          userStore.theme = val as ThemeKey;
        }}
      >
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
                    snap.theme === option.key
                      ? (themes[option.key]?.primary ?? '$backgroundStrong')
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
                      snap.theme === option.key
                        ? (themes[option.key]?.onPrimary ?? '$color')
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
