import { X } from '@tamagui/lucide-icons';
import type { SizeTokens, ThemeName } from 'tamagui';
import { Chip } from './chipsParts';
import { memo, useMemo } from 'react';

export type Tag = {
  id: number;
  name: string;
  slug: string;
  organization: number;
};

export type TagBubbleProps = {
  tag: Tag;
  size?: SizeTokens;
  editable?: boolean;
  /**
   * Called when user presses the X button (only shown if editable)
   */
  onRemove?: (tag: Tag) => void;
  /**
   * Called when user presses the bubble itself
   */
  onPress?: (tag: Tag) => void;
};

// A small helper to deterministically map a tag id to a theme color
const themePalette: ThemeName[] = [
  'red',
  'green',
  'blue',
  'purple',
  'pink',
  'orange',
];
const pickTheme = (tagId: number): ThemeName =>
  themePalette[tagId % themePalette.length];

export const TagBubble = memo(function TagBubble({
  tag,
  size,
  editable = false,
  onRemove,
  onPress,
}: TagBubbleProps) {
  const theme = useMemo(() => pickTheme(tag.id), [tag.id]);

  return (
    <Chip
      rounded
      size={size}
      theme={theme}
      pressable={!!onPress}
      onPress={onPress ? () => onPress(tag) : undefined}
    >
      <Chip.Text>{tag.name}</Chip.Text>
      {editable && (
        <Chip.Button alignRight onPress={() => onRemove?.(tag)}>
          <Chip.Icon>
            <X color="$color9" />
          </Chip.Icon>
        </Chip.Button>
      )}
    </Chip>
  );
});
