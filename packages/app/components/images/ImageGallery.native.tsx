import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, Image, ActivityIndicator, Dimensions, Pressable, Text } from 'react-native';
import { Galeria } from '@nandorojo/galeria';
import type { ImageGalleryProps, GalleryItem } from './ImageGalleryCore';
import { buildViewerUrls } from './ImageGalleryCore';
import { useObjectImages, useOrgImages, useDetachImage, useReorderImages, useAttachImages, BASE_URL } from '@bbook/data';
import { RNImageUploader } from './RNImageUploader.native';

const COLS = 3;
const GAP = 6;
const { width: SCREEN_W } = Dimensions.get('window');
const CELL = Math.floor((SCREEN_W - GAP * (COLS + 1)) / COLS);

const DEFAULT_PAGE = 30;

// Child: object-target mode (hooks unconditionally called here)
const ObjectGalleryNative: React.FC<ImageGalleryProps> = ({ orgSlug, target, pageSize = DEFAULT_PAGE, showUploaderButton }) => {
  const [offset, setOffset] = useState(0);
  const [acc, setAcc] = useState<GalleryItem[]>([]);
  const [count, setCount] = useState(0);

  const params = { limit: pageSize, offset } as const;
  const objectQ = useObjectImages(orgSlug, target!, { params });
  const detach = useDetachImage(orgSlug, target!);
  const reorder = useReorderImages(orgSlug, target!);
  const attach = useAttachImages(orgSlug, target!);

  const pageItems: GalleryItem[] = useMemo(() => {
    const res = objectQ?.data;
    const list = res && res.success ? res.data.items : [];
    if (!list) return [];
    return list.map((it: any) => {
      const image = it.image ?? it;
      const id = image.id as number;
      const thumbRaw: string = image.variants?.thumb ?? image.url;
      const viewRaw: string = image.variants?.lg ?? image.url;
      const toAbs = (u: string) => (typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))
        ? u
        : `${BASE_URL}${u?.startsWith('/') ? u : `/${u}`}`);
      const thumbUrl = toAbs(thumbRaw);
      const viewUrl = toAbs(viewRaw);
      return { id, thumbUrl, viewUrl } as GalleryItem;
    });
  }, [objectQ?.data]);

  useEffect(() => {
    const res = objectQ?.data;
    if (!res || !res.success) return;
    setCount(res.data.count);
    setAcc((prev) => {
      const map = new Map(prev.map((i) => [i.id, i] as const));
      for (const it of pageItems) map.set(it.id, it);
      return Array.from(map.values());
    });
  }, [pageItems, objectQ?.data]);

  const urls = useMemo(() => buildViewerUrls(acc), [acc]);
  const loading = objectQ?.isLoading ?? false;
  const error = objectQ?.error as Error | undefined;
  const hasMore = acc.length < count;
  const canReorder = !hasMore && acc.length > 1;

  if (loading) {
    return (
      <View style={{ padding: 12, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: 'crimson', marginBottom: 8 }}>Failed to load images.</Text>
        <Text selectable style={{ color: '#555' }}>{error.message}</Text>
      </View>
    );
  }

  if (acc.length === 0) {
    return (
      <View style={{ padding: 24, alignItems: 'center', gap: 8 }}>
        <Text style={{ color: '#666' }}>No images yet.</Text>
        {showUploaderButton && (
          <RNImageUploader
            orgSlug={orgSlug}
            multiple
            onUploaded={(ids) => {
              if (ids.length) {
                attach.mutate(ids, {
                  onSuccess: () => {
                    setAcc([]);
                    setOffset(0);
                  },
                });
              }
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={{ padding: GAP }}>
      {showUploaderButton && (
        <View style={{ marginBottom: 8 }}>
          <RNImageUploader
            orgSlug={orgSlug}
            multiple
            onUploaded={(ids) => {
              if (ids.length) {
                attach.mutate(ids, {
                  onSuccess: () => {
                    setAcc([]);
                    setOffset(0);
                  },
                });
              }
            }}
          />
        </View>
      )}
      <Galeria urls={urls}>
        <FlatList
          data={acc}
          keyExtractor={(it) => String(it.id)}
          numColumns={COLS}
          columnWrapperStyle={{ gap: GAP }}
          ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasMore && !loading) setOffset((o) => o + pageSize);
          }}
          renderItem={({ item, index }) => (
            <View style={{ position: 'relative' }}>
              <Galeria.Image index={index}>
                <Image
                  source={{ uri: item.thumbUrl }}
                  style={{ width: CELL, height: CELL, borderRadius: 8, backgroundColor: '#eee' }}
                />
              </Galeria.Image>
              <Pressable
                onPress={() => detach.mutate(item.id, {
                  onSuccess: () => setAcc((prev) => prev.filter((i) => i.id !== item.id)),
                })}
                style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}
                pointerEvents="auto"
              >
                <Text style={{ color: 'white', fontSize: 12 }}>Detach</Text>
              </Pressable>
              {canReorder && (
                <View style={{ position: 'absolute', left: 6, top: 6, flexDirection: 'row', gap: 6 }} pointerEvents="box-none">
                  <Pressable
                    onPress={() => {
                      if (index <= 0) return;
                      setAcc((prev) => {
                        const next = [...prev];
                        const tmp = next[index - 1];
                        next[index - 1] = next[index];
                        next[index] = tmp;
                        reorder.mutate(next.map((i) => i.id));
                        return next;
                      });
                    }}
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}
                  >
                    <Text style={{ color: 'white', fontSize: 12 }}>↑</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setAcc((prev) => {
                        if (index >= prev.length - 1) return prev;
                        const next = [...prev];
                        const tmp = next[index + 1];
                        next[index + 1] = next[index];
                        next[index] = tmp;
                        reorder.mutate(next.map((i) => i.id));
                        return next;
                      });
                    }}
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}
                  >
                    <Text style={{ color: 'white', fontSize: 12 }}>↓</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
          ListFooterComponent={hasMore ? (
            <View style={{ paddingVertical: 12 }}><ActivityIndicator /></View>
          ) : null}
        />
      </Galeria>
    </View>
  );
};

// Child: org-wide mode
const OrgGalleryNative: React.FC<ImageGalleryProps> = ({ orgSlug, pageSize = DEFAULT_PAGE }) => {
  const [offset, setOffset] = useState(0);
  const [acc, setAcc] = useState<GalleryItem[]>([]);
  const [count, setCount] = useState(0);

  const params = { limit: pageSize, offset } as const;
  const orgQ = useOrgImages(orgSlug, { params });

  const pageItems: GalleryItem[] = useMemo(() => {
    const res = orgQ?.data;
    const list = res && res.success ? res.data.items : [];
    if (!list) return [];
    return list.map((it: any) => {
      const image = it.image ?? it;
      const id = image.id as number;
      const thumbRaw: string = image.variants?.thumb ?? image.url;
      const viewRaw: string = image.variants?.lg ?? image.url;
      const toAbs = (u: string) => (typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))
        ? u
        : `${BASE_URL}${u?.startsWith('/') ? u : `/${u}`}`);
      const thumbUrl = toAbs(thumbRaw);
      const viewUrl = toAbs(viewRaw);
      return { id, thumbUrl, viewUrl } as GalleryItem;
    });
  }, [orgQ?.data]);

  useEffect(() => {
    const res = orgQ?.data;
    if (!res || !res.success) return;
    setCount(res.data.count);
    setAcc((prev) => {
      const map = new Map(prev.map((i) => [i.id, i] as const));
      for (const it of pageItems) map.set(it.id, it);
      return Array.from(map.values());
    });
  }, [pageItems, orgQ?.data]);

  const urls = useMemo(() => buildViewerUrls(acc), [acc]);
  const loading = orgQ?.isLoading ?? false;
  const error = orgQ?.error as Error | undefined;
  const hasMore = acc.length < count;

  if (loading) {
    return (
      <View style={{ padding: 12, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: 'crimson', marginBottom: 8 }}>Failed to load images.</Text>
        <Text selectable style={{ color: '#555' }}>{error.message}</Text>
      </View>
    );
  }

  if (acc.length === 0) {
    return (
      <View style={{ padding: 24, alignItems: 'center', gap: 8 }}>
        <Text style={{ color: '#666' }}>No images yet.</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: GAP }}>
      <Galeria urls={urls}>
        <FlatList
          data={acc}
          keyExtractor={(it) => String(it.id)}
          numColumns={COLS}
          columnWrapperStyle={{ gap: GAP }}
          ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasMore && !loading) setOffset((o) => o + pageSize);
          }}
          renderItem={({ item, index }) => (
            <View style={{ position: 'relative' }}>
              <Galeria.Image index={index}>
                <Image
                  source={{ uri: item.thumbUrl }}
                  style={{ width: CELL, height: CELL, borderRadius: 8, backgroundColor: '#eee' }}
                />
              </Galeria.Image>
            </View>
          )}
          ListFooterComponent={hasMore ? (
            <View style={{ paddingVertical: 12 }}><ActivityIndicator /></View>
          ) : null}
        />
      </Galeria>
    </View>
  );
};

const ImageGalleryNative: React.FC<ImageGalleryProps> = (props) => {
  if (props.target) {
    return <ObjectGalleryNative {...props} />;
  }
  return <OrgGalleryNative {...props} />;
};

export default ImageGalleryNative;
