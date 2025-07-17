import { Spinner, XStack, YStack, Text } from '@bbook/ui';
import { TagList } from '@bbook/ui';
import {
  useEntityTags,
  useAssignTags,
  useUnassignTags,
  useCreateTag,
} from '@bbook/data/src/hooks/useTags';
import { useTranslation } from '@bbook/i18n';
import type { TaggableEntity } from '@bbook/data/src/constants/taggable_entities';
import type { Tag } from '@bbook/data/src/schemas/tags';

import { TagCombobox } from '../../features/tags/components/TagCombobox';

export interface TagListContainerProps {
  orgSlug: string;
  entityType: TaggableEntity;
  entityId: string | number;
  editable?: boolean;
  tags?: Tag[];
}

import { useState } from 'react';

export function TagListContainer({
  orgSlug,
  entityType,
  entityId,
  editable,
  tags: initialTags,
}: TagListContainerProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const { data: fetchedTags, isLoading } = useEntityTags(
    orgSlug,
    entityType,
    entityId,
    {
      enabled: !!orgSlug,
    }
  );

  const tags = initialTags ?? (fetchedTags?.success ? fetchedTags.data : []);

  const { mutate: assignTags, isPending: isAssigning } = useAssignTags(
    orgSlug,
    {
      userId: 'current_user',
    }
  );
  const { mutate: unassignTags } = useUnassignTags(orgSlug, {
    userId: 'current_user',
  });
  const { mutate: createTag, isPending: isCreating } = useCreateTag(orgSlug);

  const handleRemove = (tag: Tag) => {
    unassignTags({ entityType, entityId, tagIds: [tag.id] });
  };

  const handleAssignTag = (tag: Tag) => {
    setError(null);
    assignTags(
      { entityType, entityId, tagIds: [tag.id] },
      {
        onError: (err: any) => {
          let msg = t('errors.tags.assign_error');
          if (err?.message?.includes('Network'))
            msg = t('errors.tags.assign_network_error');
          setError(msg);
        },
        onSuccess: () => {
          setError(null);
          setInputValue('');
        },
      }
    );
  };

  const handleCreateTag = (tagName: string) => {
    setError(null);
    createTag(
      { name: tagName },
      {
        onSuccess: (data) => {
          if (data.success) {
            handleAssignTag(data.data);
            setInputValue('');
          }
        },
        onError: (err: any) => {
          let msg = t('errors.tags.create_error');
          if (err?.message?.includes('exists'))
            msg = t('errors.tags.create_exists_error');
          else if (err?.message?.includes('Network'))
            msg = t('errors.tags.create_network_error');
          setError(msg);
        },
      }
    );
  };

  if (isLoading && !initialTags) {
    return (
      <YStack justifyContent="center" alignItems="center" p="$4">
        <Spinner />
      </YStack>
    );
  }

  return (
    <XStack gap="$2" flexWrap="wrap" alignItems="center">
      <TagList
        tags={tags ?? []}
        editable={editable}
        onRemoveTag={handleRemove}
      />
      {editable && (
        <YStack>
          <TagCombobox
            orgSlug={orgSlug}
            onAssignTag={handleAssignTag}
            onCreateTag={handleCreateTag}
            userId="current_user"
            assignedTags={tags ?? []}
            isProcessing={isAssigning || isCreating}
            inputValue={inputValue}
            onInputValueChange={setInputValue}
          />
          {error && (
            <Text color="$red10" marginTop="$2" fontSize="$3">
              {error}
            </Text>
          )}
        </YStack>
      )}
    </XStack>
  );
}
