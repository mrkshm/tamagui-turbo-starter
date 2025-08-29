import * as v from 'valibot';
import { PaginatedApiResponseSchema } from './api';

// Variants provided by backend
export const imageVariantsSchema = v.object({
  original: v.string(),
  thumb: v.string(),
  sm: v.string(),
  md: v.string(),
  lg: v.string(),
});
export type ImageVariants = v.InferInput<typeof imageVariantsSchema>;

export const imageSchema = v.object({
  id: v.number(),
  file: v.nullish(v.string()),
  url: v.string(),
  variants: imageVariantsSchema,
  title: v.nullish(v.string()),
  description: v.nullish(v.string()),
  alt_text: v.nullish(v.string()),
  organization_id: v.nullish(v.number()),
  creator_id: v.nullish(v.number()),
  created_at: v.string(),
  updated_at: v.string(),
});
export type ImageOut = v.InferInput<typeof imageSchema>;

export const polymorphicImageRelationSchema = v.object({
  id: v.number(),
  image: imageSchema,
  // Some backends may return a string (e.g., "contact") instead of an object
  content_type: v.union([
    v.object({ id: v.number(), app_label: v.string(), model: v.string() }),
    v.string(),
  ]),
  object_id: v.number(),
  is_cover: v.boolean(),
  // Allow null/undefined for order
  order: v.nullish(v.number()),
});
export type PolymorphicImageRelationOut = v.InferInput<
  typeof polymorphicImageRelationSchema
>;

// Lists
export const paginatedImagesSchema = PaginatedApiResponseSchema(imageSchema);
export type PaginatedImages = v.InferInput<typeof paginatedImagesSchema>;

export const paginatedRelationsSchema = PaginatedApiResponseSchema(
  polymorphicImageRelationSchema
);
export type PaginatedRelations = v.InferInput<typeof paginatedRelationsSchema>;

// Inputs
export const imageIdsInSchema = v.object({ image_ids: v.array(v.number()) });
export type ImageIdsIn = v.InferInput<typeof imageIdsInSchema>;

export const bulkImageIdsInSchema = imageIdsInSchema;
export type BulkImageIdsIn = v.InferInput<typeof bulkImageIdsInSchema>;

export const reorderInSchema = v.object({ image_ids: v.array(v.number()) });
export type ReorderIn = v.InferInput<typeof reorderInSchema>;

// Bulk upload response items (as returned by backend)
export const bulkUploadItemSchema = v.object({
  id: v.number(),
  file: v.string(),
  status: v.string(),
  error: v.nullish(v.string()),
});
export type BulkUploadItem = v.InferInput<typeof bulkUploadItemSchema>;
