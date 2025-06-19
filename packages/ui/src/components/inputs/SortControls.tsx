import { useState, useCallback } from 'react';
import { XStack, YStack, Text, Select, Adapt, Sheet, Button } from 'tamagui';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ArrowDownAZ, ArrowUpAZ } from '@tamagui/lucide-icons';

export type SortField = {
  /**
   * Field identifier used for sorting
   */
  id: string;

  /**
   * Display name for the field
   */
  label: string;
};

export type SortDirection = 'asc' | 'desc';

export interface SortControlsProps {
  /**
   * Available fields to sort by
   */
  fields: SortField[];

  /**
   * Currently selected field
   */
  selectedField: string;

  /**
   * Current sort direction
   */
  direction: SortDirection;

  /**
   * Callback when sort options change
   */
  onSortChange: (field: string, direction: SortDirection) => void;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * SortControls component for selecting sort field and direction
 * Adapts between mobile and desktop layouts
 */
export const SortControls = ({
  fields,
  selectedField,
  direction,
  onSortChange,
  testID = 'sort-controls',
}: SortControlsProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Find the currently selected field
  const currentField =
    fields.find((field) => field.id === selectedField) || fields[0];

  // Handle sort direction toggle
  const handleToggleDirection = useCallback(() => {
    onSortChange(selectedField, direction === 'asc' ? 'desc' : 'asc');
    // Close the sort panel after toggling direction on mobile
    if (isMobile) {
      setIsOpen(false);
    }
  }, [selectedField, direction, onSortChange, isMobile]);

  // Toggle sort direction (alias for handleToggleDirection)
  const toggleDirection = handleToggleDirection;

  // Handle field selection
  const handleFieldChange = useCallback(
    (value: string) => {
      onSortChange(value, direction);
      // Close the sort panel after selection on both mobile and web
      setIsOpen(false);
    },
    [direction, onSortChange]
  );

  // Mobile version uses a sheet
  if (isMobile) {
    return (
      <YStack width="100%">
        <Button
          onPress={() => setIsOpen(true)}
          backgroundColor="$background"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$2"
          paddingHorizontal="$3"
          paddingVertical="$2"
          testID={testID}
        >
          <XStack
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Text>Sort by: {currentField.label}</Text>
            {/* {direction === 'asc' ? (
              <ArrowUpAZ size={16} color="#999" />
            ) : (
              <ArrowDownAZ size={16} color="#999" />
            )} */}
          </XStack>
        </Button>

        <Sheet
          modal
          open={isOpen}
          onOpenChange={setIsOpen}
          snapPoints={[50]}
          dismissOnSnapToBottom
          position={0}
          zIndex={100000}
        >
          <Sheet.Overlay />
          <Sheet.Frame padding="$4">
            <Sheet.Handle />
            <YStack gap="$4">
              <Text fontWeight="bold" fontSize="$5">
                Sort by
              </Text>
              <YStack gap="$2">
                {fields.map((field) => (
                  <Button
                    key={field.id}
                    onPress={() => handleFieldChange(field.id)}
                    backgroundColor={
                      field.id === selectedField
                        ? '$backgroundHover'
                        : '$background'
                    }
                    justifyContent="flex-start"
                    paddingVertical="$2"
                    paddingHorizontal="$3"
                    borderRadius="$2"
                    testID={`${testID}-field-${field.id}`}
                  >
                    <XStack
                      width="100%"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Text>{field.label}</Text>
                      {field.id === selectedField && (
                        <Button
                          size="$2"
                          circular
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleDirection();
                          }}
                          backgroundColor="transparent"
                          testID={`${testID}-direction`}
                        >
                          {direction === 'asc' ? (
                            <ArrowUpAZ size={18} color="#999" />
                          ) : (
                            <ArrowDownAZ size={18} color="#999" />
                          )}
                        </Button>
                      )}
                    </XStack>
                  </Button>
                ))}
              </YStack>
            </YStack>
          </Sheet.Frame>
        </Sheet>
      </YStack>
    );
  }

  // Desktop version uses a dropdown
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      gap="$0"
      testID={testID}
    >
      <Text>Sort by:</Text>
      <Select
        id="sort-field"
        value={selectedField}
        onValueChange={handleFieldChange}
        disablePreventBodyScroll
      >
        <Select.Trigger width="75%">
          <Select.Value placeholder="Select a field" />
        </Select.Trigger>

        <Adapt when={'sm' as any} platform="touch">
          <Sheet
            modal
            snapPoints={[50]}
            dismissOnSnapToBottom
            position={0}
            zIndex={100000}
          >
            <Sheet.Frame padding="$4">
              <Sheet.Handle />
              <Adapt.Contents />
            </Sheet.Frame>
          </Sheet>
        </Adapt>

        <Select.Content zIndex={200000}>
          <Select.Viewport minWidth={200}>
            <Select.Group>
              {fields.map((field) => (
                <Select.Item
                  key={field.id}
                  index={0}
                  value={field.id}
                  testID={`${testID}-field-${field.id}`}
                >
                  <Select.ItemText>{field.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select>

      <Button
        size="$2"
        circular
        onPress={toggleDirection}
        backgroundColor="$background"
        borderColor="$borderColor"
        borderWidth={1}
        hoverStyle={{ backgroundColor: '$backgroundHover' }}
        pressStyle={{ backgroundColor: '$backgroundPress' }}
        testID={`${testID}-direction`}
        aria-label={`Sort direction: ${direction === 'asc' ? 'Ascending' : 'Descending'}`}
      >
        {direction === 'asc' ? (
          <ArrowUpAZ size={18} color="$text" />
        ) : (
          <ArrowDownAZ size={18} color="$text" />
        )}
      </Button>
    </XStack>
  );
};
