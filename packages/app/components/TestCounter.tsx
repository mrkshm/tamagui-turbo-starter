import { Button, XStack, YStack, Text, Card } from 'tamagui';
import { useSnapshot } from 'valtio';
import { testStore, increment, decrement } from '@bbook/stores/src/testStore';

export const TestCounter = () => {
  const snap = useSnapshot(testStore);

  return (
    <Card elevate bordered padding="$4" width={200} alignItems="center">
      <Text fontSize={20} fontWeight="bold" marginBottom="$2">
        Tamagui Counter
      </Text>
      <XStack alignItems="center" space>
        <Button size="$3" onPress={decrement} aria-label="Decrement">
          -
        </Button>
        <YStack alignItems="center" justifyContent="center" width={48}>
          <Text fontSize={24}>{snap.count}</Text>
        </YStack>
        <Button size="$3" onPress={increment} aria-label="Increment">
          +
        </Button>
      </XStack>
    </Card>
  );
};
