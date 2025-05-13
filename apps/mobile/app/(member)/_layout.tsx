import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { useTheme } from '@bbook/ui';

export default function MemberLayout() {
  const theme = useTheme();
  const backgroundColor = theme.background?.val;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </SafeAreaView>
  );
}
