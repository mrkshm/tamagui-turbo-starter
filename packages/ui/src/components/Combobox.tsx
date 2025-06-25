import {
  Adapt,
  Input,
  Popover,
  PopoverProps,
  Sheet,
  Spinner,
  YStack,
  Paragraph,
  XStack,
} from 'tamagui';
import { ReactNode, useEffect, useId, useRef, useState } from 'react';
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
  inputProps?: any; // CInputProps was causing issues, using any for now
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const highlightedId =
    highlightedIndex > -1
      ? `${listboxId}-${items[highlightedIndex].id}`
      : undefined;

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setHighlightedIndex(-1);
    }
  };

  // Effect to handle keyboard navigation directly on the input element
  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle navigation and selection
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(
            (prev) => (prev - 1 + items.length) % items.length
          );
          break;
        case 'Enter':
          if (highlightedIndex >= 0) {
            e.preventDefault();
            onSelectItem(items[highlightedIndex]);
            handleOpenChange(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleOpenChange(false);
          onInputValueChange('');
          break;
        default:
          break;
      }
    };

    inputElement.addEventListener('keydown', handleKeyDown);

    return () => {
      inputElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, items, highlightedIndex, onSelectItem, onInputValueChange]);

  const listComponent = (
    <YStack id={listboxId} role={'listbox' as any}>
      {isLoading ? (
        <YStack padding="$4" alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      ) : (
        <ScrollView style={{ maxHeight: 200 }}>
          {items.length > 0 ? (
            items.map((item, index) => (
              <YStack
                key={item.id}
                id={`${listboxId}-${item.id}`}
                role={'option' as any}
                aria-selected={index === highlightedIndex}
                onPress={() => {
                  onSelectItem(item);
                  handleOpenChange(false); // Close popover on selection
                }}
                backgroundColor={
                  index === highlightedIndex ? '$backgroundHover' : undefined
                }
                hoverStyle={{
                  backgroundColor: '$backgroundHover',
                }}
                padding="$3"
                cursor="pointer"
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
      onOpenChange={handleOpenChange}
      {...popoverProps}
    >
      <Popover.Trigger asChild>
        <XStack alignItems="center" position="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChangeText={(text) => {
              onInputValueChange(text);
              setHighlightedIndex(-1);
              if (!open) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            {...inputProps}
            // ARIA attributes for accessibility
            role={'combobox' as any}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={highlightedId}
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
              cursor="pointer"
              paddingHorizontal="$2"
            >
              <X size={16} color="$gray10" />
            </YStack>
          )}
        </XStack>
      </Popover.Trigger>

      <Adapt when={'sm' as any} platform="touch">
        <Sheet modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4">
            <YStack gap="$4">
              <Input
                focusOnMount
                value={inputValue}
                onChangeText={onInputValueChange}
                placeholder={placeholder}
                {...inputProps}
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
