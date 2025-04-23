import { YStack } from '@bbook/ui';
import { Text as TamaguiText } from '@bbook/ui';
import { ScrollView } from 'react-native';
import { ThemeSwitcher } from './ThemeSwitcher';

export function HelloWorld() {
  return (
    <ScrollView style={{ flex: 1, width: '100%' }}>
      <YStack backgroundColor="$background" width="100%" gap="$4">
        <TamaguiText fontSize="$4" color="$textPrimary" fontFamily="$body">
          Hello from the App Package !
        </TamaguiText>

        <TamaguiText
          fontSize="$4"
          marginTop="$2"
          color="$textSecondary"
          fontFamily="$body"
        >
          If you see this, the App Package is working!
        </TamaguiText>

        <ThemeSwitcher label="Theme" />
      </YStack>
    </ScrollView>
  );
}
