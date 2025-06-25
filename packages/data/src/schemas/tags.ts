import * as v from 'valibot';
import {
  PaginatedApiResponseSchema,
  SingleEntityApiResponseSchema,
} from './api';

export const tagSchema = v.object({
  id: v.number(),
  name: v.string(),
  slug: v.string(),
  organization: v.number(),
});
export type Tag = v.InferInput<typeof tagSchema>;

export const tagCreationPayloadSchema = v.object({
  name: v.string(),
});
export type TagCreationPayload = v.InferInput<typeof tagCreationPayloadSchema>;

export const tagAssignPayloadSchema = v.array(v.number());
export type TagAssignPayload = v.InferInput<typeof tagAssignPayloadSchema>;

export const paginatedTagsSchema = PaginatedApiResponseSchema(tagSchema);
export type PaginatedTags = v.InferInput<typeof paginatedTagsSchema>;

export const singleTagSchema = SingleEntityApiResponseSchema(tagSchema);
export type TagApiResponse = v.InferInput<typeof singleTagSchema>;

export const tagUpdatePayloadSchema = v.object({
  name: v.string(),
});
export type TagUpdatePayload = v.InferInput<typeof tagUpdatePayloadSchema>;

export const tagUnassignPayloadSchema = v.array(v.number());
export type TagUnassignPayload = v.InferInput<typeof tagUnassignPayloadSchema>;

export const tagUnassignResponseSchema = v.object({
  removed_count: v.number(),
});
export type TagUnassignResponse = v.InferInput<
  typeof tagUnassignResponseSchema
>;
