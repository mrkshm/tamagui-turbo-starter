import * as v from 'valibot';
import { PaginatedApiResponseSchema, paginationQueryParamsSchema } from './api';

export const contactSchema = v.object({
  display_name: v.string(),
  slug: v.optional(v.string()),
  first_name: v.optional(v.string()),
  last_name: v.optional(v.string()),
  email: v.optional(v.string()),
  location: v.optional(v.string()),
  phone: v.optional(v.nullable(v.string())),
  notes: v.optional(v.nullable(v.string())),
  avatar_path: v.optional(v.nullable(v.string())),
  creator: v.optional(v.string()),
  tags: v.optional(
    v.array(
      v.object({
        id: v.number(),
        name: v.string(),
        slug: v.string(),
        organization: v.number(),
      })
    )
  ),
  created_at: v.optional(v.string()),
  updated_at: v.optional(v.string()),
});
export type Contact = v.InferInput<typeof contactSchema>;

export const paginatedContactsSchema =
  PaginatedApiResponseSchema(contactSchema);
export type PaginatedContacts = v.InferInput<typeof paginatedContactsSchema>;

// Valid sortable fields
export const SORTABLE_FIELDS = [
  'display_name',
  'first_name',
  'last_name',
  'email',
  'created_at',
  'updated_at',
] as const;

export type SortableField = (typeof SORTABLE_FIELDS)[number];
export type SortOrder = 'asc' | 'desc';

export const sortOrderSchema = v.union([v.literal('asc'), v.literal('desc')]);

export const sortFieldSchema = v.union([
  v.literal('display_name'),
  v.literal('first_name'),
  v.literal('last_name'),
  v.literal('email'),
  v.literal('created_at'),
  v.literal('updated_at'),
]);

export const contactsQueryParamsSchema = v.object({
  ...paginationQueryParamsSchema.entries,
  search: v.optional(v.string()),
  sort_by: v.optional(sortFieldSchema),
  sort_order: v.optional(sortOrderSchema),
});

export type ContactsQueryParams = v.InferInput<
  typeof contactsQueryParamsSchema
>;
