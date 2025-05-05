import { Text, YStack, Button } from '@bbook/ui';
import { SafeAreaView } from 'react-native';
import { useAuth } from '@bbook/app/provider/auth-provider';

export default function MemberHome() {
  const { user, logout, isLoading } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        padding="$4"
        gap="$4"
        width="100%"
        flex={1}
        backgroundColor="$background"
      >
        <Text>Hello World - Member Area</Text>
        <Text>Debug info:</Text>
        <Text>User: {user ? JSON.stringify(user) : 'null'}</Text>
        <Text>Loading: {String(isLoading)}</Text>
        <Text>isAuthenticated: {String(!!user)}</Text>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : user ? (
          <Button
            height="$6"
            theme="red"
            onPress={() => {
              // Call logout function
              logout();
            }}
          >
            Logout
          </Button>
        ) : null}
      </YStack>
    </SafeAreaView>
  );
}
