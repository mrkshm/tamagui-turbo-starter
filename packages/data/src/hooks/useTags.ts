import * as v from 'valibot';
import { useQuery, useMutation, useQueryClient } from '../query';
import type { UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '../fetcher';
import { tagsEndpoints } from '../endpoints/tags';
import {
  tagSchema,
  paginatedTagsSchema,
  type Tag,
  type PaginatedTags,
  type TagCreationPayload,
  type TagUpdatePayload,
  type TagUnassignResponse,
  tagUnassignResponseSchema,
} from '../schemas/tags';
import { PaginationQueryParams } from '../schemas/api';
import { ValidationResult } from '../validator';
import { TaggableEntity } from '../constants/taggable_entities';
import { contactQueryKeys } from './useContact';
import { useDebounce } from 'use-debounce';

// Simple success schema for delete endpoint
const deleteSuccessSchema = v.object({ success: v.boolean() });

// ----------------------------------------------
// Query Keys
// ----------------------------------------------
export const tagQueryKeys = {
  all: (org: string) => ['orgs', org, 'tags'] as const,
  lists: (org: string) => [...tagQueryKeys.all(org), 'list'] as const,
  list: (org: string, params: Record<string, unknown> = {}) =>
    [...tagQueryKeys.lists(org), { params }] as const,
  details: (org: string) => [...tagQueryKeys.all(org), 'detail'] as const,
  detail: (org: string, slug: string) =>
    [...tagQueryKeys.details(org), slug] as const,
  entity: (org: string, entity: TaggableEntity, id: string | number) =>
    [...tagQueryKeys.all(org), 'entity', entity, id] as const,
};

// ----------------------------------------------
// Queries
// ----------------------------------------------
export function useTags(
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
): UseQueryResult<ValidationResult<PaginatedTags>, Error> {
  const queryKey = tagQueryKeys.list(orgSlug, params);

  return useQuery({
    queryKey,
    queryFn: () =>
      apiClient.get<PaginatedTags>(
        tagsEndpoints.GET_TAGS.url(orgSlug),
        paginatedTagsSchema,
        { params, userId }
      ),
    enabled,
  });
}

export function useSearchTags(
  orgSlug: string,
  searchTerm: string,
  { userId = 'current_user' }: { userId?: string } = {}
) {
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const queryKey = tagQueryKeys.list(orgSlug, { q: debouncedSearchTerm });

  const query = useQuery({
    queryKey,
    queryFn: () =>
      apiClient.get<PaginatedTags>(
        tagsEndpoints.SEARCH_TAGS.url(orgSlug),
        paginatedTagsSchema,
        { params: { q: debouncedSearchTerm }, userId }
      ),
    enabled: !!debouncedSearchTerm,
  });

  return {
    ...query,
    isLoading: query.isLoading && query.fetchStatus !== 'idle',
  };
}

export function useTag(
  orgSlug: string,
  slug: string,
  {
    enabled = true,
    userId = 'current_user',
  }: { enabled?: boolean; userId?: string } = {}
): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: tagQueryKeys.detail(orgSlug, slug),
    queryFn: () =>
      apiClient.get<Tag>(
        tagsEndpoints.GET_TAG_BY_SLUG.url(orgSlug, slug),
        tagSchema,
        { userId }
      ),
    enabled: enabled && !!slug,
  });
}

export function useEntityTags(
  orgSlug: string,
  entityType: TaggableEntity,
  entityId: string | number,
  {
    enabled = true,
    userId = 'current_user',
  }: { enabled?: boolean; userId?: string } = {}
) {
  const queryKey = tagQueryKeys.entity(orgSlug, entityType, entityId);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await apiClient.get<PaginatedTags>(
        tagsEndpoints.GET_ENTITY_TAGS.url(orgSlug, entityType, entityId),
        paginatedTagsSchema,
        { userId }
      );
      if (res.success) {
        return { success: true, data: res.data.items };
      }
      return res as any;
    },
    enabled,
  });
}

// ----------------------------------------------
// Mutations
// ----------------------------------------------
export function useCreateTag(
  orgSlug: string,
  { userId = 'current_user' } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createTag', orgSlug],
    mutationFn: (payload: TagCreationPayload) =>
      apiClient.post<Tag>(
        tagsEndpoints.CREATE_TAG.url(orgSlug),
        tagSchema,
        payload,
        { userId }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.lists(orgSlug) });
    },
  });
}

export function useUpdateTag(
  orgSlug: string,
  tagId: string | number,
  { userId = 'current_user' } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateTag', orgSlug, tagId],
    mutationFn: (updates: Omit<TagUpdatePayload, 'id'>) =>
      apiClient.patch<Tag>(
        tagsEndpoints.UPDATE_TAG.url(orgSlug, tagId),
        tagSchema,
        updates,
        { userId }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tagQueryKeys.detail(orgSlug, String(tagId)),
      });
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.lists(orgSlug) });
    },
  });
}

export function useDeleteTag(
  orgSlug: string,
  tagId: string | number,
  { userId = 'current_user' } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteTag', orgSlug, tagId],
    mutationFn: () =>
      apiClient.delete<{ success: boolean }>(
        tagsEndpoints.DELETE_TAG.url(orgSlug, tagId),
        deleteSuccessSchema,
        { userId }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.lists(orgSlug) });
      queryClient.invalidateQueries({
        queryKey: tagQueryKeys.detail(orgSlug, String(tagId)),
      });
    },
  });
}

export function useAssignTags(
  orgSlug: string,
  { userId = 'current_user' } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['assignTags', orgSlug],
    mutationFn: ({
      entityType,
      entityId,
      tagIds,
    }: {
      entityType: TaggableEntity;
      entityId: string | number;
      tagIds: number[];
    }) => {
      const url = tagsEndpoints.ASSIGN_TAGS.url(orgSlug, entityType, entityId);
      return apiClient.post<Tag[]>(url, v.array(tagSchema), tagIds, { userId });
    },
    onSuccess: (_, { entityType, entityId }) => {
      const entityKey = tagQueryKeys.entity(orgSlug, entityType, entityId);
      const tagsListKey = tagQueryKeys.lists(orgSlug);
      queryClient.invalidateQueries({ queryKey: entityKey });
      queryClient.invalidateQueries({ queryKey: tagsListKey });

      if (entityType === 'contact') {
        const contactDetailKey = contactQueryKeys.detail(entityId.toString());
        // Use .all which is ['contacts'] to invalidate all contact lists
        const contactsListKey = contactQueryKeys.all;
        queryClient.invalidateQueries({ queryKey: contactDetailKey });
        queryClient.invalidateQueries({ queryKey: contactsListKey });
      }
    },
  });
}

export function useUnassignTags(
  orgSlug: string,
  { userId = 'current_user' } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['unassignTags', orgSlug],
    mutationFn: ({
      entityType,
      entityId,
      tagIds,
    }: {
      entityType: TaggableEntity;
      entityId: string | number;
      tagIds: number[];
    }) =>
      apiClient.delete<TagUnassignResponse>(
        tagsEndpoints.UNASSIGN_TAGS.url(orgSlug, entityType, entityId),
        tagUnassignResponseSchema,
        {
          body: JSON.stringify(tagIds),
          headers: {
            'Content-Type': 'application/json',
          },
          userId,
        }
      ),
    onSuccess: (_, { entityType, entityId }) => {
      const entityKey = tagQueryKeys.entity(orgSlug, entityType, entityId);
      const tagsListKey = tagQueryKeys.lists(orgSlug);
      queryClient.invalidateQueries({ queryKey: entityKey });
      queryClient.invalidateQueries({ queryKey: tagsListKey });

      if (entityType === 'contact') {
        const contactDetailKey = contactQueryKeys.detail(entityId.toString());
        // Use .all which is ['contacts'] to invalidate all contact lists
        const contactsListKey = contactQueryKeys.all;
        queryClient.invalidateQueries({ queryKey: contactDetailKey });
        queryClient.invalidateQueries({ queryKey: contactsListKey });
      }
    },
  });
}
