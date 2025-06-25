import { YStack } from 'tamagui';
import { TagBubble, Tag } from './TagBubble';

export type TagListProps = {
  tags: Tag[];
  gap?: number | string;
  editable?: boolean;
  onRemoveTag?: (tag: Tag) => void;
};

/**
 * Pure presentational list of TagBubble components.
 * Use TagListContainer (packages/app) for data-aware version.
 */
export function TagList({
  tags,
  gap = '$2',
  editable,
  onRemoveTag,
}: TagListProps) {
  return (
    <YStack flexDirection="row" flexWrap="wrap" gap={gap}>
      {tags.map((t) => (
        <TagBubble
          key={t.id}
          tag={t}
          editable={editable}
          onRemove={onRemoveTag}
        />
      ))}
    </YStack>
  );
}
