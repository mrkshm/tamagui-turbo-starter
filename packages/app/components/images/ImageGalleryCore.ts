import type { PolymorphicTarget } from '@bbook/data';

export type ImageGalleryTarget = PolymorphicTarget | undefined;

export type ImageGalleryProps = {
  orgSlug: string;
  target?: ImageGalleryTarget;
  pageSize?: number;
  selectionMode?: 'none' | 'single' | 'multi';
  showUploaderButton?: boolean;
  // Callbacks (optional)
  onDetach?: (imageId: number) => void;
  onReorder?: (imageIds: number[]) => void;
  onOpenViewer?: (index: number) => void;
  onCloseViewer?: () => void;
};

export type GalleryItem = {
  id: number;
  thumbUrl: string;
  viewUrl: string;
};

export type GalleryState = {
  viewerIndex: number | null;
};

export const buildViewerUrls = (items: GalleryItem[]): string[] =>
  items.map((i) => i.viewUrl);

export const defaultColumnCount = 3;
