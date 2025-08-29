import { useQuery, useMutation, useQueryClient } from '../query';
import type { UseQueryResult } from '@tanstack/react-query';
import { type PolymorphicTarget } from '../endpoints/images';
import { type PaginatedImages, type PaginatedRelations } from '../schemas/images';
import {
  listOrgImages,
  listObjectImages,
  uploadImage,
  bulkUploadImages,
  attachImages,
  bulkAttachImages,
  bulkDetachImages,
  detachImage,
  reorderImages,
  setCoverImage,
  unsetCoverImage,
} from '../services/images';
import { PaginationQueryParams } from '../schemas/api';
import { ValidationResult } from '../validator';

// ----------------------------------------------
// Query Keys
// ----------------------------------------------
export const imagesQueryKeys = {
  all: (org: string) => ['orgs', org, 'images'] as const,
  lists: (org: string) => [...imagesQueryKeys.all(org), 'list'] as const,
  listOrg: (org: string, params: Record<string, unknown> = {}) =>
    [...imagesQueryKeys.lists(org), { params }] as const,
  object: (
    org: string,
    target: PolymorphicTarget,
    params: Record<string, unknown> = {}
  ) =>
    [
      ...imagesQueryKeys.all(org),
      'object',
      target.appLabel,
      target.model,
      target.objId,
      { params },
    ] as const,
};

// ----------------------------------------------
// Queries
// ----------------------------------------------
export function useOrgImages(
  orgSlug: string,
  {
    enabled = true,
    params = {},
    userId = 'current_user',
  }: {
    enabled?: boolean;
    params?: PaginationQueryParams;
    userId?: string;
  } = {}
): UseQueryResult<ValidationResult<PaginatedImages>, Error> {
  const queryKey = imagesQueryKeys.listOrg(orgSlug, params);

  return useQuery({
    queryKey,
    queryFn: () => listOrgImages(orgSlug, params, { userId }),
    enabled,
  });
}

export function useUnsetCoverImage(
  orgSlug: string,
  target: PolymorphicTarget,
  { userId = 'current_user' } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['unsetCoverImage', orgSlug, target.appLabel, target.model, target.objId],
    mutationFn: () => unsetCoverImage(orgSlug, target, { userId }),
    onMutate: async () => {
      const basePrefix = [
        'orgs',
        orgSlug,
        'images',
        'object',
        target.appLabel,
        target.model,
        target.objId,
      ] as const;
      await queryClient.cancelQueries({ queryKey: basePrefix });
      const snapshots = queryClient.getQueriesData({ queryKey: basePrefix, exact: false });

      snapshots.forEach(([key, data]: any) => {
        if (!data || !data.items) return;
        const updated = data.items.map((rel: any) => ({ ...rel, is_cover: false }));
        queryClient.setQueryData(key, { ...data, items: updated });
      });

      return { snapshots } as { snapshots: Array<[unknown, any]> };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(([key, prev]: any) => {
        queryClient.setQueryData(key, prev);
      });
    },
    onSettled: () => {
      const basePrefix = [
        'orgs',
        orgSlug,
        'images',
        'object',
        target.appLabel,
        target.model,
        target.objId,
      ] as const;
      queryClient.invalidateQueries({ queryKey: basePrefix, exact: false });
    },
  });
}

export function useSetCoverImage(
  orgSlug: string,
  target: PolymorphicTarget,
  { userId = 'current_user' } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['setCoverImage', orgSlug, target.appLabel, target.model, target.objId],
    mutationFn: (imageId: number) => setCoverImage(orgSlug, target, imageId, { userId }),
    onMutate: async (imageId: number) => {
      const basePrefix = [
        'orgs',
        orgSlug,
        'images',
        'object',
        target.appLabel,
        target.model,
        target.objId,
      ] as const;
      await queryClient.cancelQueries({ queryKey: basePrefix });
      const snapshots = queryClient.getQueriesData({ queryKey: basePrefix, exact: false });

      snapshots.forEach(([key, data]: any) => {
        if (!data || !data.items) return;
        const updated = data.items.map((rel: any) => ({
          ...rel,
          is_cover: Number(rel?.image?.id) === Number(imageId),
        }));
        queryClient.setQueryData(key, { ...data, items: updated });
      });

      return { snapshots } as { snapshots: Array<[unknown, any]> };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(([key, prev]: any) => {
        queryClient.setQueryData(key, prev);
      });
    },
    onSettled: () => {
      const basePrefix = [
        'orgs',
        orgSlug,
        'images',
        'object',
        target.appLabel,
        target.model,
        target.objId,
      ] as const;
      queryClient.invalidateQueries({ queryKey: basePrefix, exact: false });
    },
  });
}

export function useObjectImages(
  orgSlug: string,
  target: PolymorphicTarget,
  {
    enabled = true,
    params = {},
    userId = 'current_user',
  }: {
    enabled?: boolean;
    params?: PaginationQueryParams;
    userId?: string;
  } = {}
): UseQueryResult<ValidationResult<PaginatedRelations>, Error> {
  const queryKey = imagesQueryKeys.object(orgSlug, target, params);

  return useQuery({
    queryKey,
    queryFn: () => listObjectImages(orgSlug, target, params, { userId }),
    enabled,
  });
}

// ----------------------------------------------
// Mutations
// ----------------------------------------------
export function useUploadImage(orgSlug: string, { userId = 'current_user' } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['uploadImage', orgSlug],
    mutationFn: (form: FormData) => uploadImage(orgSlug, form, { userId, timeout: 60000 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesQueryKeys.lists(orgSlug) });
    },
    onError: (err) => {
      console.error('[useUploadImage] error', err);
    },
  });
}

export function useBulkUploadImages(
  orgSlug: string,
  { userId = 'current_user', idempotencyKey }: { userId?: string; idempotencyKey?: string } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['bulkUploadImages', orgSlug],
    mutationFn: (form: FormData) =>
      bulkUploadImages(orgSlug, form, { userId, idempotencyKey, timeout: 120000 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesQueryKeys.lists(orgSlug) });
    },
    onError: (err) => {
      console.error('[useBulkUploadImages] error', err);
    },
  });
}

export function useAttachImages(
  orgSlug: string,
  target: PolymorphicTarget,
  { userId = 'current_user' } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['attachImages', orgSlug, target.appLabel, target.model, target.objId],
    mutationFn: (imageIds: number[]) => attachImages(orgSlug, target, imageIds, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesQueryKeys.object(orgSlug, target) });
    },
  });
}

export function useBulkAttachImages(
  orgSlug: string,
  target: PolymorphicTarget,
  { userId = 'current_user', idempotencyKey }: { userId?: string; idempotencyKey?: string } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['bulkAttachImages', orgSlug, target.appLabel, target.model, target.objId],
    mutationFn: (imageIds: number[]) =>
      bulkAttachImages(orgSlug, target, imageIds, { userId, idempotencyKey }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesQueryKeys.object(orgSlug, target) });
    },
  });
}

export function useBulkDetachImages(
  orgSlug: string,
  target: PolymorphicTarget,
  { userId = 'current_user', idempotencyKey }: { userId?: string; idempotencyKey?: string } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['bulkDetachImages', orgSlug, target.appLabel, target.model, target.objId],
    mutationFn: (imageIds: number[]) =>
      bulkDetachImages(orgSlug, target, imageIds, { userId, idempotencyKey }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesQueryKeys.object(orgSlug, target) });
    },
  });
}

export function useDetachImage(
  orgSlug: string,
  target: PolymorphicTarget,
  { userId = 'current_user' } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['detachImage', orgSlug, target.appLabel, target.model, target.objId],
    mutationFn: (imageId: number | string) =>
      detachImage(orgSlug, target, Number(imageId), { userId }).then(() => ({ success: true })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesQueryKeys.object(orgSlug, target) });
    },
  });
}

export function useReorderImages(
  orgSlug: string,
  target: PolymorphicTarget,
  { userId = 'current_user' } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['reorderImages', orgSlug, target.appLabel, target.model, target.objId],
    mutationFn: (imageIds: number[]) =>
      reorderImages(orgSlug, target, imageIds, { userId }),
    // Optimistic update: reorder cached items immediately
    onMutate: async (imageIds: number[]) => {
      // Build a prefix WITHOUT params so it matches all variants of this target
      const basePrefix = [
        'orgs',
        orgSlug,
        'images',
        'object',
        target.appLabel,
        target.model,
        target.objId,
      ] as const;
      // Cancel ongoing fetches so our optimistic update isn't overwritten
      await queryClient.cancelQueries({ queryKey: basePrefix });

      // Snapshot all matching queries (same target, any params)
      const snapshots = queryClient.getQueriesData({ queryKey: basePrefix, exact: false });

      // Apply optimistic reorder to each snapshot
      snapshots.forEach(([key, data]: any) => {
        if (!data || !data.items) return;

        const idToIndex = new Map<number, number>(
          imageIds.map((id, idx) => [Number(id), idx])
        );

        const reordered = [...data.items]
          .sort((a: any, b: any) => {
            const ai = idToIndex.get(Number(a?.image?.id)) ?? Number.MAX_SAFE_INTEGER;
            const bi = idToIndex.get(Number(b?.image?.id)) ?? Number.MAX_SAFE_INTEGER;
            return ai - bi;
          })
          // keep the order field coherent if present
          .map((rel: any, idx: number) => ({ ...rel, order: idx }));

        queryClient.setQueryData(key, { ...data, items: reordered });
      });

      // Return snapshots for rollback
      return { snapshots } as { snapshots: Array<[unknown, any]> };
    },
    onError: (_err, _vars, ctx) => {
      // Rollback to previous snapshots
      ctx?.snapshots?.forEach(([key, prev]: any) => {
        queryClient.setQueryData(key, prev);
      });
    },
    onSettled: () => {
      // Revalidate to sync with server's authoritative order (all param variants)
      const basePrefix = [
        'orgs',
        orgSlug,
        'images',
        'object',
        target.appLabel,
        target.model,
        target.objId,
      ] as const;
      queryClient.invalidateQueries({ queryKey: basePrefix, exact: false });
    },
  });
}
