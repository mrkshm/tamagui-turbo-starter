import * as v from 'valibot';
import { apiClient } from '../fetcher';
import { imagesEndpoints, type PolymorphicTarget } from '../endpoints/images';
import {
  imageSchema,
  paginatedImagesSchema,
  paginatedRelationsSchema,
  imageIdsInSchema,
  bulkImageIdsInSchema,
  reorderInSchema,
  polymorphicImageRelationSchema,
  type ImageOut,
  bulkUploadItemSchema,
  type BulkUploadItem,
  type PaginatedImages,
  type PaginatedRelations,
  type PolymorphicImageRelationOut,
} from '../schemas/images';
import type { PaginationQueryParams } from '../schemas/api';
import type { ValidationResult } from '../validator';

export type IdempotentOpts = { idempotencyKey?: string };
export type ServiceOpts = { userId?: string; timeout?: number } & IdempotentOpts;

const withIdempotency = (headers: HeadersInit | undefined, key?: string): HeadersInit | undefined =>
  key ? { ...(headers || {}), 'Idempotency-Key': key } : headers;

// Queries
export function listOrgImages(
  orgSlug: string,
  params: PaginationQueryParams = {},
  opts: ServiceOpts = {}
): Promise<ValidationResult<PaginatedImages>> {
  return apiClient.get<PaginatedImages>(
    imagesEndpoints.LIST_ORG_IMAGES.url(orgSlug),
    paginatedImagesSchema,
    { params, userId: opts.userId, timeout: opts.timeout }
  );
}

export function unsetCoverImage(
  orgSlug: string,
  target: PolymorphicTarget,
  opts: ServiceOpts = {}
): Promise<ValidationResult<{ detail: string }>> {
  const responseSchema = v.object({ detail: v.string() });
  // POST with empty body
  return apiClient.post<{ detail: string}>(
    imagesEndpoints.UNSET_COVER.url(orgSlug, target),
    responseSchema,
    {},
    {
      userId: opts.userId,
      skipValidation: true,
      timeout: opts.timeout,
    }
  );
}

export function listObjectImages(
  orgSlug: string,
  target: PolymorphicTarget,
  params: PaginationQueryParams = {},
  opts: ServiceOpts = {}
): Promise<ValidationResult<PaginatedRelations>> {
  return apiClient.get<PaginatedRelations>(
    imagesEndpoints.LIST_OBJECT_IMAGES.url(orgSlug, target),
    paginatedRelationsSchema,
    { params, userId: opts.userId, timeout: opts.timeout }
  );
}

// Mutations
export function uploadImage(
  orgSlug: string,
  form: FormData,
  opts: ServiceOpts = {}
): Promise<ValidationResult<ImageOut>> {
  return apiClient.post<ImageOut>(
    imagesEndpoints.UPLOAD_IMAGE.url(orgSlug),
    imageSchema,
    form,
    { userId: opts.userId, skipStringify: true, timeout: opts.timeout }
  );
}

export function bulkUploadImages(
  orgSlug: string,
  form: FormData,
  opts: ServiceOpts = {}
): Promise<ValidationResult<BulkUploadItem[]>> {
  return apiClient.post<BulkUploadItem[]>(
    imagesEndpoints.BULK_UPLOAD.url(orgSlug),
    v.array(bulkUploadItemSchema),
    form,
    {
      userId: opts.userId,
      skipStringify: true,
      headers: withIdempotency(undefined, opts.idempotencyKey),
      timeout: opts.timeout,
    }
  );
}

export function attachImages(
  orgSlug: string,
  target: PolymorphicTarget,
  imageIds: number[],
  opts: ServiceOpts = {}
): Promise<ValidationResult<PolymorphicImageRelationOut[]>> {
  return apiClient.post<PolymorphicImageRelationOut[]>(
    imagesEndpoints.ATTACH_IMAGES.url(orgSlug, target),
    v.array(polymorphicImageRelationSchema),
    { image_ids: imageIds },
    {
      userId: opts.userId,
      validateRequest: true,
      requestSchema: imageIdsInSchema,
      skipValidation: true,
      timeout: opts.timeout,
    }
  );
}

export function bulkAttachImages(
  orgSlug: string,
  target: PolymorphicTarget,
  imageIds: number[],
  opts: ServiceOpts = {}
): Promise<ValidationResult<{ attached: number[] }>> {
  const responseSchema = v.object({ attached: v.array(v.number()) });
  return apiClient.post(
    imagesEndpoints.BULK_ATTACH_IMAGES.url(orgSlug, target),
    responseSchema,
    { image_ids: imageIds },
    {
      userId: opts.userId,
      validateRequest: true,
      requestSchema: bulkImageIdsInSchema,
      headers: withIdempotency(undefined, opts.idempotencyKey),
      timeout: opts.timeout,
    }
  );
}

export function bulkDetachImages(
  orgSlug: string,
  target: PolymorphicTarget,
  imageIds: number[],
  opts: ServiceOpts = {}
): Promise<ValidationResult<{ detached: number[] }>> {
  const responseSchema = v.object({ detached: v.array(v.number()) });
  return apiClient.post(
    imagesEndpoints.BULK_DETACH_IMAGES.url(orgSlug, target),
    responseSchema,
    { image_ids: imageIds },
    {
      userId: opts.userId,
      validateRequest: true,
      requestSchema: bulkImageIdsInSchema,
      headers: withIdempotency(undefined, opts.idempotencyKey),
      timeout: opts.timeout,
    }
  );
}

export function detachImage(
  orgSlug: string,
  target: PolymorphicTarget,
  imageId: number,
  opts: ServiceOpts = {}
): Promise<ValidationResult<unknown>> {
  return apiClient
    .delete(
      imagesEndpoints.DETACH_IMAGE.url(orgSlug, target, imageId),
      v.any(),
      { userId: opts.userId, skipValidation: true, timeout: opts.timeout }
    )
    .then(() => ({ success: true, data: undefined } as ValidationResult<unknown>));
}

export function reorderImages(
  orgSlug: string,
  target: PolymorphicTarget,
  imageIds: number[],
  opts: ServiceOpts = {}
): Promise<ValidationResult<PolymorphicImageRelationOut[]>> {
  return apiClient.post<PolymorphicImageRelationOut[]>(
    imagesEndpoints.REORDER_IMAGES.url(orgSlug, target),
    v.array(polymorphicImageRelationSchema),
    { image_ids: imageIds },
    {
      userId: opts.userId,
      validateRequest: true,
      requestSchema: reorderInSchema,
      skipValidation: true,
      timeout: opts.timeout,
    }
  );
}

export function setCoverImage(
  orgSlug: string,
  target: PolymorphicTarget,
  imageId: number,
  opts: ServiceOpts = {}
): Promise<ValidationResult<{ detail: string }>> {
  const responseSchema = v.object({ detail: v.string() });
  return apiClient.post<{ detail: string}>(
    imagesEndpoints.SET_COVER.url(orgSlug, target),
    responseSchema,
    { image_id: imageId },
    {
      userId: opts.userId,
      validateRequest: true,
      requestSchema: v.object({ image_id: v.number() }),
      skipValidation: true,
      timeout: opts.timeout,
    }
  );
}

export function bulkDeleteImages(
  orgSlug: string,
  imageIds: number[],
  opts: ServiceOpts = {}
): Promise<ValidationResult<{ deleted: number[] }>> {
  const responseSchema = v.object({ deleted: v.array(v.number()) });
  // Backend expects POST /bulk-delete/ with { ids: [...] }
  return apiClient.post(
    imagesEndpoints.BULK_DELETE.url(orgSlug),
    responseSchema,
    { ids: imageIds },
    {
      userId: opts.userId,
      headers: withIdempotency(undefined, opts.idempotencyKey),
      timeout: opts.timeout,
    }
  );
}
