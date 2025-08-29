import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ImageGalleryProps, GalleryItem } from './ImageGalleryCore';
import { buildViewerUrls } from './ImageGalleryCore';
import { useObjectImages, useOrgImages, useDetachImage, useReorderImages, useUploadImage, useBulkUploadImages, useAttachImages, BASE_URL } from '@bbook/data';
import { Galeria } from '@nandorojo/galeria';

const CELL_MIN = 160; // px
const GAP = 8; // px

const DEFAULT_PAGE = 30;

// Child component for object-target mode (hooks unconditionally called here)
const ObjectGalleryWeb: React.FC<ImageGalleryProps> = ({ orgSlug, target, showUploaderButton, pageSize = DEFAULT_PAGE }) => {
  const [offset, setOffset] = useState(0);
  const [acc, setAcc] = useState<GalleryItem[]>([]);
  const [count, setCount] = useState(0);

  const params = { limit: pageSize, offset } as const;
  const objectQ = useObjectImages(orgSlug, target!, { params });
  const detach = useDetachImage(orgSlug, target!);
  const reorder = useReorderImages(orgSlug, target!);
  const uploadSingle = useUploadImage(orgSlug);
  const uploadBulk = useBulkUploadImages(orgSlug);
  const attach = useAttachImages(orgSlug, target!);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onPickFiles = () => fileInputRef.current?.click();
  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const form = new FormData();
    if (files.length === 1) {
      form.append('file', files[0]);
      const res = await uploadSingle.mutateAsync(form);
      if (res.success) {
        const ids = [res.data.id];
        await attach.mutateAsync(ids);
        setAcc([]);
        setOffset(0);
      }
    } else {
      for (const f of files) form.append('files', f);
      const res = await uploadBulk.mutateAsync(form);
      if (res.success) {
        const ids = Array.isArray(res.data) ? res.data.map((it: any) => it?.id).filter(Boolean) : [];
        if (ids.length) {
          await attach.mutateAsync(ids);
        }
        setAcc([]);
        setOffset(0);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pageItems: GalleryItem[] = useMemo(() => {
    const res = objectQ?.data;
    const list = res && res.success ? res.data.items : [];
    if (!list) return [];
    const normalize = (raw?: string) => {
      if (!raw) return '';
      if (raw.startsWith('http')) return raw;
      return `${BASE_URL}${raw.startsWith('/') ? raw : `/${raw}`}`;
    };
    return list.map((it: any) => {
      const image = it.image ?? it;
      const id = image.id as number;
      const variants = image.variants ?? {};
      const thumbRaw = variants.thumb || variants.sm || variants.md || variants.original || image.url;
      const viewRaw = variants.lg || variants.md || variants.original || image.url;
      const thumbUrl = normalize(thumbRaw);
      const viewUrl = normalize(viewRaw);
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

  if (loading) return <div style={{ padding: 12 }}>Loading…</div>;
  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ color: 'crimson', marginBottom: 8 }}>Failed to load images.</div>
        <pre style={{ color: '#555', whiteSpace: 'pre-wrap' }}>{error.message}</pre>
      </div>
    );
  }

  if (acc.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ color: '#666', marginBottom: 8 }}>No images yet.</div>
        {showUploaderButton && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onFilesSelected} style={{ display: 'none' }} />
            <button onClick={onPickFiles} style={{ background: '#1e90ff', color: 'white', padding: '8px 12px', borderRadius: 8, border: 0, cursor: 'pointer' }}>
              {uploadSingle.isPending || uploadBulk.isPending ? 'Uploading…' : 'Upload'}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: GAP }}>
      {showUploaderButton && (
        <div style={{ marginBottom: 8 }}>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onFilesSelected} style={{ display: 'none' }} />
          <button onClick={onPickFiles} style={{ background: '#1e90ff', color: 'white', padding: '8px 12px', borderRadius: 8, border: 0, cursor: 'pointer' }}>
            {uploadSingle.isPending || uploadBulk.isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      )}
      <Galeria urls={urls}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${CELL_MIN}px, 1fr))`, gap: GAP }}>
          {acc.map((item, index) => (
            <div key={item.id} style={{ position: 'relative' }}>
              <Galeria.Image index={index}>
                <img src={item.thumbUrl} alt="" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 8, background: '#eee', display: 'block' }} />
              </Galeria.Image>
              {canReorder && (
                <div style={{ position: 'absolute', left: 6, top: 6, display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => {
                      if (index <= 0) return;
                      setAcc((prev) => {
                        const snapshot = prev;
                        const next = prev.slice();
                        const tmp = next[index - 1];
                        next[index - 1] = next[index];
                        next[index] = tmp;
                        reorder.mutate(next.map((i) => i.id), {
                          onError: () => setAcc(snapshot),
                        });
                        return next;
                      });
                    }}
                    style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: 0, padding: '2px 6px', borderRadius: 10, cursor: 'pointer' }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => {
                      setAcc((prev) => {
                        if (index >= prev.length - 1) return prev;
                        const snapshot = prev;
                        const next = prev.slice();
                        const tmp = next[index + 1];
                        next[index + 1] = next[index];
                        next[index] = tmp;
                        reorder.mutate(next.map((i) => i.id), {
                          onError: () => setAcc(snapshot),
                        });
                        return next;
                      });
                    }}
                    style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: 0, padding: '2px 6px', borderRadius: 10, cursor: 'pointer' }}
                  >
                    ↓
                  </button>
                  {index > 0 && (
                    <button
                      onClick={() => {
                        setAcc((prev) => {
                          if (index <= 0) return prev;
                          const snapshot = prev;
                          const next = prev.slice();
                          const [moved] = next.splice(index, 1);
                          next.unshift(moved);
                          reorder.mutate(next.map((i) => i.id), {
                            onError: () => setAcc(snapshot),
                          });
                          return next;
                        });
                      }}
                      title="Set cover"
                      style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: 0, padding: '2px 6px', borderRadius: 10, cursor: 'pointer' }}
                    >
                      Set cover
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={() => detach.mutate(item.id, { onSuccess: () => setAcc((prev) => prev.filter((i) => i.id !== item.id)) })}
                style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: 'white', border: 0, padding: '4px 8px', borderRadius: 10, cursor: 'pointer' }}
              >
                Detach
              </button>
            </div>
          ))}
        </div>
        {hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
            <button
              onClick={() => {
                if (hasMore && !loading) setOffset((o) => o + pageSize);
              }}
              style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </Galeria>
    </div>
  );
};

// Child component for organization-wide mode
const OrgGalleryWeb: React.FC<ImageGalleryProps> = ({ orgSlug, showUploaderButton, pageSize = DEFAULT_PAGE }) => {
  const [offset, setOffset] = useState(0);
  const [acc, setAcc] = useState<GalleryItem[]>([]);
  const [count, setCount] = useState(0);

  const params = { limit: pageSize, offset } as const;
  const orgQ = useOrgImages(orgSlug, { params });
  const uploadSingle = useUploadImage(orgSlug);
  const uploadBulk = useBulkUploadImages(orgSlug);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onPickFiles = () => fileInputRef.current?.click();
  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const form = new FormData();
    if (files.length === 1) {
      form.append('file', files[0]);
      const res = await uploadSingle.mutateAsync(form);
      if (res.success) {
        setAcc([]);
        setOffset(0);
      }
    } else {
      for (const f of files) form.append('files', f);
      const res = await uploadBulk.mutateAsync(form);
      if (res.success) {
        setAcc([]);
        setOffset(0);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pageItems: GalleryItem[] = useMemo(() => {
    const res = orgQ?.data;
    const list = res && res.success ? res.data.items : [];
    if (!list) return [];
    const normalize = (raw?: string) => {
      if (!raw) return '';
      if (raw.startsWith('http')) return raw;
      return `${BASE_URL}${raw.startsWith('/') ? raw : `/${raw}`}`;
    };
    return list.map((it: any) => {
      const image = it.image ?? it;
      const id = image.id as number;
      const variants = image.variants ?? {};
      const thumbRaw = variants.thumb || variants.sm || variants.md || variants.original || image.url;
      const viewRaw = variants.lg || variants.md || variants.original || image.url;
      const thumbUrl = normalize(thumbRaw);
      const viewUrl = normalize(viewRaw);
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

  if (loading) return <div style={{ padding: 12 }}>Loading…</div>;
  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ color: 'crimson', marginBottom: 8 }}>Failed to load images.</div>
        <pre style={{ color: '#555', whiteSpace: 'pre-wrap' }}>{error.message}</pre>
      </div>
    );
  }

  if (acc.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ color: '#666', marginBottom: 8 }}>No images yet.</div>
        {showUploaderButton && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onFilesSelected} style={{ display: 'none' }} />
            <button onClick={onPickFiles} style={{ background: '#1e90ff', color: 'white', padding: '8px 12px', borderRadius: 8, border: 0, cursor: 'pointer' }}>
              {uploadSingle.isPending || uploadBulk.isPending ? 'Uploading…' : 'Upload'}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: GAP }}>
      {showUploaderButton && (
        <div style={{ marginBottom: 8 }}>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onFilesSelected} style={{ display: 'none' }} />
          <button onClick={onPickFiles} style={{ background: '#1e90ff', color: 'white', padding: '8px 12px', borderRadius: 8, border: 0, cursor: 'pointer' }}>
            {uploadSingle.isPending || uploadBulk.isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      )}
      <Galeria urls={urls}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${CELL_MIN}px, 1fr))`, gap: GAP }}>
          {acc.map((item, index) => (
            <div key={item.id} style={{ position: 'relative' }}>
              <Galeria.Image index={index}>
                <img src={item.thumbUrl} alt="" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 8, background: '#eee', display: 'block' }} />
              </Galeria.Image>
            </div>
          ))}
        </div>
        {hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
            <button
              onClick={() => {
                if (hasMore && !loading) setOffset((o) => o + pageSize);
              }}
              style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </Galeria>
    </div>
  );
};

const ImageGalleryWeb: React.FC<ImageGalleryProps> = (props) => {
  if (props.target) {
    return <ObjectGalleryWeb {...props} />;
  }
  return <OrgGalleryWeb {...props} />;
};

export default ImageGalleryWeb;
