import { HTTP_METHODS } from '../constants/constants';
import { Endpoint } from './index';
import {
  ImageOut,
  PaginatedImages,
  PaginatedRelations,
  ImageIdsIn,
  BulkImageIdsIn,
  ReorderIn,
  PolymorphicImageRelationOut,
  BulkUploadItem,
} from '../schemas/images';
import { PaginationQueryParams } from '../schemas/api';

export type PolymorphicTarget = {
  appLabel: string;
  model: string;
  objId: number | string;
};

const objectBase = (
  org_slug: string,
  target: PolymorphicTarget
) =>
  `/images/orgs/${org_slug}/images/${target.appLabel}/${target.model}/${target.objId}/`;

export const imagesEndpoints = {
  // Org-level
  LIST_ORG_IMAGES: {
    url: (org_slug: string) => `/images/orgs/${org_slug}/images/`,
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as PaginatedImages,
  } as Endpoint<PaginationQueryParams, PaginatedImages, undefined, [string]>,

  UPLOAD_IMAGE: {
    url: (org_slug: string) => `/images/orgs/${org_slug}/images/`,
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as FormData,
    responseType: {} as ImageOut,
  } as Endpoint<FormData, ImageOut, undefined, [string]>,

  BULK_UPLOAD: {
    url: (org_slug: string) => `/images/orgs/${org_slug}/bulk-upload/`,
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as FormData,
    responseType: {} as BulkUploadItem[],
  } as Endpoint<FormData, BulkUploadItem[], undefined, [string]>,

  BULK_DELETE: {
    url: (org_slug: string) => `/images/orgs/${org_slug}/bulk-delete/`,
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as BulkImageIdsIn,
    responseType: {} as { deleted: number[] },
  } as Endpoint<BulkImageIdsIn, { deleted: number[] }, undefined, [string]>,

  // Object-level
  LIST_OBJECT_IMAGES: {
    url: (org_slug: string, target: PolymorphicTarget) =>
      objectBase(org_slug, target),
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as PaginatedRelations,
  } as Endpoint<PaginationQueryParams, PaginatedRelations, undefined, [string, PolymorphicTarget]>,

  ATTACH_IMAGES: {
    url: (org_slug: string, target: PolymorphicTarget) =>
      objectBase(org_slug, target),
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as ImageIdsIn,
    responseType: {} as PolymorphicImageRelationOut[],
  } as Endpoint<ImageIdsIn, PolymorphicImageRelationOut[], undefined, [string, PolymorphicTarget]>,

  BULK_ATTACH_IMAGES: {
    url: (org_slug: string, target: PolymorphicTarget) =>
      objectBase(org_slug, target) + 'bulk_attach/',
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as BulkImageIdsIn,
    responseType: {} as { attached: number[] },
  } as Endpoint<BulkImageIdsIn, { attached: number[] }, undefined, [string, PolymorphicTarget]>,

  BULK_DETACH_IMAGES: {
    url: (org_slug: string, target: PolymorphicTarget) =>
      objectBase(org_slug, target) + 'bulk_detach/',
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as BulkImageIdsIn,
    responseType: {} as { detached: number[] },
  } as Endpoint<BulkImageIdsIn, { detached: number[] }, undefined, [string, PolymorphicTarget]>,

  DETACH_IMAGE: {
    url: (
      org_slug: string,
      target: PolymorphicTarget,
      image_id: number | string
    ) => objectBase(org_slug, target) + `${image_id}/`,
    method: HTTP_METHODS.DELETE,
    requiresAuth: true,
    // 204 No Content — consumer should call with skipValidation
    responseType: {} as unknown,
  } as Endpoint<never, unknown, undefined, [string, PolymorphicTarget, number | string]>,

  REORDER_IMAGES: {
    url: (org_slug: string, target: PolymorphicTarget) =>
      objectBase(org_slug, target) + 'reorder',
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as ReorderIn,
    responseType: {} as PolymorphicImageRelationOut[],
  } as Endpoint<ReorderIn, PolymorphicImageRelationOut[], undefined, [string, PolymorphicTarget]>,
  
  SET_COVER: {
    url: (org_slug: string, target: PolymorphicTarget) =>
      objectBase(org_slug, target) + 'set_cover',
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    // request: { image_id: number }, response: { detail: string }
    requestType: {} as { image_id: number },
    responseType: {} as { detail: string },
  } as Endpoint<{ image_id: number }, { detail: string }, undefined, [string, PolymorphicTarget]>,

  UNSET_COVER: {
    url: (org_slug: string, target: PolymorphicTarget) =>
      objectBase(org_slug, target) + 'unset_cover',
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as Record<string, never>,
    responseType: {} as { detail: string },
  } as Endpoint<Record<string, never>, { detail: string }, undefined, [string, PolymorphicTarget]>,
} as const;

export type ImagesApi = {
  // org
  listOrgImages: (orgSlug: string, params?: PaginationQueryParams) => Promise<PaginatedImages>;
  uploadImage: (orgSlug: string, data: FormData) => Promise<ImageOut>;
  bulkUploadImages: (orgSlug: string, data: FormData) => Promise<BulkUploadItem[]>;
  bulkDeleteImages: (orgSlug: string, imageIds: number[]) => Promise<{ deleted: number[] }>;
  // object
  listObjectImages: (
    orgSlug: string,
    target: PolymorphicTarget,
    params?: PaginationQueryParams
  ) => Promise<PaginatedRelations>;
  attachImages: (
    orgSlug: string,
    target: PolymorphicTarget,
    imageIds: number[]
  ) => Promise<PolymorphicImageRelationOut[]>;
  bulkAttachImages: (
    orgSlug: string,
    target: PolymorphicTarget,
    imageIds: number[]
  ) => Promise<{ attached: number[] }>;
  bulkDetachImages: (
    orgSlug: string,
    target: PolymorphicTarget,
    imageIds: number[]
  ) => Promise<{ detached: number[] }>;
  detachImage: (
    orgSlug: string,
    target: PolymorphicTarget,
    imageId: number
  ) => Promise<void>;
  reorderImages: (
    orgSlug: string,
    target: PolymorphicTarget,
    imageIds: number[]
  ) => Promise<PolymorphicImageRelationOut[]>;
  setCoverImage: (
    orgSlug: string,
    target: PolymorphicTarget,
    imageId: number
  ) => Promise<{ detail: string }>;
};
