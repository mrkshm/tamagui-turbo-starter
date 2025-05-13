import { YStack } from '@bbook/ui';
import { SafeAreaView } from 'react-native';
import { WaitingForActivation } from '@bbook/app/components/auth/WaitingForActivation';

export default function Waiting() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        padding="$4"
        gap="$4"
        width="100%"
        flex={1}
        backgroundColor="$background"
      >
        <WaitingForActivation />
      </YStack>
    </SafeAreaView>
  );
}
