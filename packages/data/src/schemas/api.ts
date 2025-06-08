import * as v from 'valibot';

export function PaginatedApiResponseSchema(
  itemSchema: v.BaseSchema<any, any, any>
) {
  return v.object({
    items: v.array(itemSchema),
    count: v.number(),
  });
}

export const paginationQueryParamsSchema = v.object({
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
});
export type PaginationQueryParams = v.InferInput<
  typeof paginationQueryParamsSchema
>;
