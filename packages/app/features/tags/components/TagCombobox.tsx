import { Combobox, type ComboboxItem, Text } from '@bbook/ui';
import { useMemo } from 'react';
import { useSearchTags } from '@bbook/data/src/hooks/useTags';
import { useTranslation } from '@bbook/i18n';
import { type Tag } from '@bbook/data/src/schemas/tags';

const CREATE_TAG_ID = 'create-new-tag';

// The Combobox can have a special item for creating a new tag, which is not a full Tag object.
// We also extend the base `ComboboxItem` with `Tag` properties to ensure type safety.
type TagComboboxItem = ComboboxItem & Partial<Tag> & { name: string };

export interface TagComboboxProps {
  orgSlug: string;
  onAssignTag: (tag: Tag) => void;
  onCreateTag: (tagName: string) => void;
  userId?: string;
  assignedTags: Tag[];
  isProcessing?: boolean;
  inputValue: string;
  onInputValueChange: (value: string) => void;
}

export function TagCombobox({
  orgSlug,
  onAssignTag,
  onCreateTag,
  userId,
  assignedTags,
  isProcessing = false,
  inputValue,
  onInputValueChange,
}: TagComboboxProps) {
  const { t } = useTranslation();
  const { data, isLoading: isSearching } = useSearchTags(orgSlug, inputValue, {
    userId,
  });

  const items: TagComboboxItem[] = useMemo(() => {
    const allRemoteItems = data?.success ? data.data.items : [];
    const unassignedRemoteItems = allRemoteItems.filter(
      (remoteItem) =>
        !assignedTags.some((assignedTag) => assignedTag.id === remoteItem.id)
    );

    if (
      inputValue &&
      !unassignedRemoteItems.find((item) => item.name === inputValue)
    ) {
      return [
        { id: CREATE_TAG_ID, name: t('common.create') + ` "${inputValue}"` },
        ...unassignedRemoteItems,
      ];
    }
    return unassignedRemoteItems;
  }, [data, inputValue, assignedTags]);

  return (
    <Combobox
      items={items}
      inputValue={inputValue}
      onInputValueChange={onInputValueChange}
      onSelectItem={(item) => {
        if (item.id === CREATE_TAG_ID) {
          onCreateTag(inputValue);
        } else {
          onAssignTag(item as Tag);
        }
      }}
      renderItem={(item) => <Text>{item.name}</Text>}
      placeholder={t('common.search_for_tag_placeholder')}
      isLoading={isSearching || isProcessing}
    />
  );
}
