import {
  Adapt,
  Input,
  InputProps,
  Paragraph,
  Popover,
  PopoverProps,
  Sheet,
  Spinner,
  YStack,
  XStack,
} from 'tamagui';
import { ReactNode, useState } from 'react';
import { ScrollView } from 'react-native';
import { X } from '@tamagui/lucide-icons';

// --- Component Props ---
export interface ComboboxItem {
  id: string;
  [key: string]: any; // Allow other properties
}

export interface ComboboxProps<T extends ComboboxItem> {
  items: T[];
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onSelectItem: (item: T) => void;
  renderItem: (item: T) => ReactNode;
  inputProps?: InputProps;
  popoverProps?: PopoverProps;
  isLoading?: boolean;
  placeholder?: string;
}

// --- Component ---
export function Combobox<T extends ComboboxItem>({
  items,
  inputValue,
  onInputValueChange,
  onSelectItem,
  renderItem,
  inputProps,
  popoverProps,
  isLoading = false,
  placeholder = 'Select an item...',
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  const listComponent = (
    <YStack>
      {isLoading ? (
        <YStack padding="$4" alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      ) : (
        <ScrollView style={{ maxHeight: 200 }}>
          {items.length > 0 ? (
            items.map((item) => (
              <YStack
                key={item.id}
                onPress={() => {
                  onSelectItem(item);
                  setOpen(false); // Close popover on selection
                }}
                hoverStyle={{
                  backgroundColor: '$backgroundHover',
                }}
                padding="$3"
                cursor="pointer"
                role="button"
              >
                {renderItem(item)}
              </YStack>
            ))
          ) : (
            <YStack padding="$4">
              <Paragraph>No results found.</Paragraph>
            </YStack>
          )}
        </ScrollView>
      )}
    </YStack>
  );

  return (
    <Popover
      size="$5"
      allowFlip
      open={open}
      onOpenChange={setOpen}
      {...popoverProps}
    >
      <Popover.Trigger asChild>
        <XStack alignItems="center" position="relative">
          <Input
            value={inputValue}
            onChangeText={(text) => {
              onInputValueChange(text);
              if (!open) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            {...(inputProps as any)}
            // Accessibility props for native
            accessibilityRole="search"
            accessibilityLabel={placeholder}
            paddingRight={inputValue ? '$8' : '$2'} // Add padding for the clear button
          />
          {inputValue && (
            <YStack
              position="absolute"
              right={10}
              top={0}
              bottom={0}
              justifyContent="center"
              onPress={() => onInputValueChange('')}
              paddingHorizontal="$2"
            >
              <X size={16} color="$gray10" />
            </YStack>
          )}
        </XStack>
      </Popover.Trigger>

      <Adapt when={'sm' as any} platform="touch">
        <Sheet modal dismissOnSnapToBottom snapPoints={[50]}>
          <Sheet.Frame padding="$4">
            <YStack gap="$4">
              <Input
                focusOnMount
                value={inputValue}
                onChangeText={onInputValueChange}
                placeholder={placeholder}
                {...(inputProps as any)}
                // Accessibility props for native
                accessibilityRole="search"
                accessibilityLabel={placeholder}
              />
              <Adapt.Contents />
            </YStack>
          </Sheet.Frame>
          <Sheet.Overlay opacity={0.2} />
        </Sheet>
      </Adapt>

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          'quick',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
        {listComponent}
      </Popover.Content>
    </Popover>
  );
}
