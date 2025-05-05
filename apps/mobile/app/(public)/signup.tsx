import { Text, YStack } from '@bbook/ui';
import { SafeAreaView } from 'react-native';

export default function Signup() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack padding="$4" gap="$4" width="100%" flex={1} backgroundColor="$background">
        <Text>Signup Page</Text>
      </YStack>
    </SafeAreaView>
  );
}
