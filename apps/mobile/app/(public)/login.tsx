import { Text, YStack } from '@bbook/ui';
import { SafeAreaView } from 'react-native';

export default function Login() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack padding="$4" gap="$4" width="100%" flex={1} backgroundColor="$background">
        <Text>Login Page</Text>
      </YStack>
    </SafeAreaView>
  );
}
