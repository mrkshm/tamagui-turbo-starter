import * as v from 'valibot';
import {
  PaginatedApiResponseSchema,
  paginationQueryParamsSchema,
  SingleEntityApiResponseSchema,
} from './api';

export const contactSchema = v.object({
  id: v.nullish(v.number()),
  display_name: v.string(),
  slug: v.nullish(v.string()),
  first_name: v.nullish(v.string()),
  last_name: v.nullish(v.string()),
  email: v.nullish(v.string()),
  location: v.nullish(v.string()),
  phone: v.nullish(v.string()),
  notes: v.nullish(v.string()),
  avatar_path: v.nullish(v.string()),
  organization: v.nullish(v.string()),
  creator: v.nullish(v.string()),
  tags: v.nullish(
    v.array(
      v.object({
        id: v.number(),
        name: v.string(),
        slug: v.string(),
        organization: v.number(),
      })
    )
  ),
  created_at: v.nullish(v.string()),
  updated_at: v.nullish(v.string()),
});

export type Contact = v.InferInput<typeof contactSchema>;

export const singleContactSchema = SingleEntityApiResponseSchema(contactSchema);

// Override with stricter TypeScript-friendly type
export type ContactApiResponse =
  | { success: true; data: Contact }
  | { success: false; error: string; data: null; status?: number };

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
