import { Stack } from 'expo-router';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { ProfileMain } from '@bbook/app/components/profile/ProfileMain';
import { ScrollView, Text, YStack } from '@bbook/ui';
import { useTheme } from '@bbook/ui';
import { HeaderBackground } from '@react-navigation/elements';
import { Spinner } from '@bbook/ui';

const ErrorText = Text;

export default function MemberHome() {
  const { user, isLoading } = useAuth();
  const theme = useTheme();
  const backgroundColor = theme.background?.val;
  const textColor = theme.textPrimary?.val;

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </YStack>
    );
  }

  if (!user) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <ErrorText>User not found</ErrorText>
      </YStack>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Profile',
          headerTintColor: textColor,
          headerBackground: () => (
            <HeaderBackground style={{ backgroundColor: backgroundColor }} />
          ),
        }}
      />
      <ScrollView>
        <ProfileMain user={user} />
      </ScrollView>
    </>
  );
}
