import { Button, XStack, YStack, Text, Card } from '@bbook/ui';
import { useTestStore } from '@bbook/stores';

export const TestCounter = () => {
  const count = useTestStore((state) => state.count);
  const increment = useTestStore((state) => state.increment);
  const decrement = useTestStore((state) => state.decrement);

  return (
    <Card
      elevate
      bordered
      padding="$4"
      width="100%"
      alignItems="center"
      marginTop="$4"
    >
      <Text fontSize={20} fontWeight="bold" marginBottom="$2">
        Tamagui Counter feat. Zustand
      </Text>
      <XStack alignItems="center" space>
        <Button size="$3" onPress={decrement} aria-label="Decrement">
          -
        </Button>
        <YStack alignItems="center" justifyContent="center" width={48}>
          <Text fontSize={24}>{count}</Text>
        </YStack>
        <Button size="$3" onPress={increment} aria-label="Increment">
          +
        </Button>
      </XStack>
    </Card>
  );
};
