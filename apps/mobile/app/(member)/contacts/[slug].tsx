import { Stack } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useContact } from '@bbook/data';
import { ContactMain } from '@bbook/app';
import { Spinner, Text, YStack } from '@bbook/ui';
import { useTheme } from '@bbook/ui';
import { HeaderBackground } from '@react-navigation/elements';

export default function ContactDetailPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: contactResponse, isLoading, error } = useContact(slug);
  const theme = useTheme();
  const backgroundColor = theme.background?.val;
  const textColor = theme.textPrimary?.val;

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" />
      </YStack>
    );
  }

  if (error || !contactResponse) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text>Error loading contact: {error?.message}</Text>
      </YStack>
    );
  }

  if (!contactResponse.success) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text>Error: {contactResponse.error || 'Failed to load contact'}</Text>
      </YStack>
    );
  }

  const contact = contactResponse.data;
  if (!contact) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text>Contact data is not available</Text>
      </YStack>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Contact',
          headerTintColor: textColor,
          headerBackground: () => (
            <HeaderBackground style={{ backgroundColor: backgroundColor }} />
          ),
        }}
      />
      <ContactMain contact={contact} />
    </>
  );
}
