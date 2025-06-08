import * as v from 'valibot';

export function PaginatedApiResponseSchema(
  itemSchema: v.BaseSchema<any, any, any>
) {
  return v.object({
    items: v.array(itemSchema),
    count: v.number(),
  });
}

export function SingleEntityApiResponseSchema(
  entitySchema: v.BaseSchema<any, any, any>
) {
  return v.union([
    v.object({
      success: v.literal(true),
      data: entitySchema,
    }),
    v.object({
      success: v.literal(false),
      error: v.string(),
      data: v.nullish(entitySchema),
    }),
  ]);
}

export const paginationQueryParamsSchema = v.object({
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
});
export type PaginationQueryParams = v.InferInput<
  typeof paginationQueryParamsSchema
>;
