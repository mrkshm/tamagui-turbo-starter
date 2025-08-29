import React, { useCallback, useMemo, useState } from 'react';
import { View, Button } from 'react-native';
// @ts-ignore - native-only dependency resolved in Expo
import { Image } from 'expo-image';
import { Galeria } from '@nandorojo/galeria';
import {
  useObjectImages,
  useDetachImage,
  useReorderImages,
  type PolymorphicTarget,
  BASE_URL,
} from '@bbook/data';

export type RNImageGalleryProps = {
  orgSlug: string;
  target: PolymorphicTarget;
  userId?: string;
};

export function RNImageGallery({ orgSlug, target, userId = 'current_user' }: RNImageGalleryProps) {
  const { data, isLoading, error } = useObjectImages(orgSlug, target, { userId });
  const detachMutation = useDetachImage(orgSlug, target, { userId });
  const reorderMutation = useReorderImages(orgSlug, target, { userId });

  const relations = useMemo(() => (data?.success ? data.data.items : []), [data]);
  const totalCount = data?.success ? data.data.count : relations.length;
  const hasMore = relations.length < totalCount;
  const canReorder = !hasMore && relations.length > 1;
  const [fallbackOriginal, setFallbackOriginal] = useState<Record<number, boolean>>({});

  const imageOrder = useMemo(() => relations.map((r: any) => r.image.id), [relations]);

  const move = useCallback(
    (index: number, direction: -1 | 1) => {
      const next = [...imageOrder];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= next.length) return;
      const [moved] = next.splice(index, 1);
      next.splice(newIndex, 0, moved);
      reorderMutation.mutate(next);
    },
    [imageOrder, reorderMutation]
  );

  const setCover = useCallback(
    (index: number) => {
      if (index === 0) return;
      const next = [...imageOrder];
      const [moved] = next.splice(index, 1);
      next.unshift(moved);
      reorderMutation.mutate(next);
    },
    [imageOrder, reorderMutation]
  );

  const detach = useCallback(
    (imageId: number) => {
      detachMutation.mutate(imageId);
    },
    [detachMutation]
  );

  // Build absolute viewer URLs in the same order
  const urls = useMemo(() => {
    return relations.map((item: any) => {
      const img = item.image ?? item;
      const viewRaw: string | undefined = img?.variants?.lg ?? img?.url;
      if (!viewRaw) return '';
      return viewRaw.startsWith('http://') || viewRaw.startsWith('https://')
        ? viewRaw
        : `${BASE_URL}${viewRaw.startsWith('/') ? viewRaw : `/${viewRaw}`}`;
    });
  }, [relations]);

  if (isLoading) return <View><Button title="Loading…" disabled /></View>;
  if (error || !data || !data.success) return <View><Button title="Failed to load" disabled /></View>;

  return (
    <Galeria urls={urls}>
      <View style={{ gap: 12, paddingVertical: 8 }}>
        {relations.map((item: any, index: number) => (
          <GalleryItem
            key={item.id}
            relation={item}
            index={index}
            onMove={move}
            onSetCover={setCover}
            onDetach={detach}
            canReorder={canReorder}
            fallbackOriginal={fallbackOriginal}
            setFallbackOriginal={setFallbackOriginal}
          />
        ))}
      </View>
    </Galeria>
  );
}

function GalleryItem({
  relation,
  index,
  onMove,
  onSetCover,
  onDetach,
  canReorder,
  fallbackOriginal,
  setFallbackOriginal,
}: {
  relation: any;
  index: number;
  onMove: (i: number, d: -1 | 1) => void;
  onSetCover: (i: number) => void;
  onDetach: (id: number) => void;
  canReorder: boolean;
  fallbackOriginal: Record<number, boolean>;
  setFallbackOriginal: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}) {
  const smRaw = relation.image?.variants?.sm || '';
  const origRaw = relation.image?.variants?.original || relation.image?.url;
  const raw = fallbackOriginal[relation.image.id] && origRaw ? origRaw : (smRaw || origRaw);
  const uri = raw && (raw as string).startsWith('http') ? raw : `${BASE_URL}${raw?.startsWith('/') ? raw : `/${raw}`}`;

  return (
    <View style={{ gap: 6 }}>
      <Galeria.Image index={index}>
        <Image
          source={{ uri }}
          style={{ width: '100%', height: 200, backgroundColor: '#eee', borderRadius: 8 }}
          contentFit="cover"
          onError={() => {
            setFallbackOriginal((s) => (s[relation.image.id] ? s : { ...s, [relation.image.id]: true }));
          }}
        />
      </Galeria.Image>
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
        <Button title="Set cover" disabled={!canReorder || index === 0} onPress={() => onSetCover(index)} />
        <Button title="Up" disabled={!canReorder} onPress={() => onMove(index, -1)} />
        <Button title="Down" disabled={!canReorder} onPress={() => onMove(index, 1)} />
        <Button title="Detach" color="#b00" onPress={() => onDetach(relation.image.id)} />
      </View>
    </View>
  );
}
