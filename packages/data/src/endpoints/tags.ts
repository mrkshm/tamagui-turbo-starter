import { HTTP_METHODS } from '../constants/constants';
import {
  taggableEntities,
  TaggableEntity,
} from '../constants/taggable_entities';
import { Endpoint } from './index';
import {
  Tag,
  PaginatedTags,
  TagCreationPayload,
  TagUpdatePayload,
  TagAssignPayload,
  TagUnassignResponse,
} from '../schemas/tags';
import { PaginationQueryParams, SearchQueryParams } from '../schemas/api';

// Helper function to build tag URLs
const buildEntityTagUrl = (
  org_slug: string,
  entityType: TaggableEntity,
  entityId: number | string,
  action?: 'assign' | 'unassign'
) => {
  const { app, model } = taggableEntities[entityType];
  const base = `/orgs/${org_slug}/tags/${app}/${model}/${entityId}/`;
  return action ? `${base}${action}/` : base;
};

export const tagsEndpoints = {
  // Get all tags with pagination
  GET_TAGS: {
    url: (org_slug: string) => `/orgs/${org_slug}/tags/`,
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as PaginatedTags,
  } as Endpoint<PaginationQueryParams, PaginatedTags, undefined, [string]>,

  // Search for tags
  SEARCH_TAGS: {
    url: (org_slug: string) => `/orgs/${org_slug}/tags/search/`,
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as PaginatedTags,
  } as Endpoint<SearchQueryParams, PaginatedTags, undefined, [string]>,

  // Get a single tag by slug
  GET_TAG_BY_SLUG: {
    url: (org_slug: string, slug: string) =>
      `/orgs/${org_slug}/tags/by-slug/${slug}/`,
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as Tag,
  } as Endpoint<undefined, Tag, undefined, [string, string]>,

  // Create a new tag
  CREATE_TAG: {
    url: (org_slug: string) => `/orgs/${org_slug}/tags/`,
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as TagCreationPayload,
    responseType: {} as Tag,
  } as Endpoint<TagCreationPayload, Tag, undefined, [string]>,

  // Update a tag
  UPDATE_TAG: {
    url: (org_slug: string, tag_id: string | number) =>
      `/orgs/${org_slug}/tags/${tag_id}/`,
    method: HTTP_METHODS.PATCH,
    requiresAuth: true,
    requestType: {} as Omit<TagUpdatePayload, 'id'>,
    responseType: {} as Tag,
  } as Endpoint<
    Omit<TagUpdatePayload, 'id'>,
    Tag,
    undefined,
    [string, string | number]
  >,

  // Delete a tag
  DELETE_TAG: {
    url: (org_slug: string, tag_id: string | number) =>
      `/orgs/${org_slug}/tags/${tag_id}/`,
    method: HTTP_METHODS.DELETE,
    requiresAuth: true,
    responseType: {} as { success: boolean },
  } as Endpoint<
    never,
    { success: boolean },
    undefined,
    [string, string | number]
  >,

  // Get tags for an entity
  GET_ENTITY_TAGS: {
    url: (
      org_slug: string,
      entityType: TaggableEntity,
      entityId: string | number
    ) => buildEntityTagUrl(org_slug, entityType, entityId),
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    // Backend returns a paginated response for entity tags
    responseType: {} as PaginatedTags,
  } as Endpoint<
    undefined,
    PaginatedTags,
    undefined,
    [string, TaggableEntity, string | number]
  >,

  // Assign tags to an entity
  ASSIGN_TAGS: {
    url: (
      org_slug: string,
      entityType: TaggableEntity,
      entityId: string | number
    ) => buildEntityTagUrl(org_slug, entityType, entityId),
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as TagAssignPayload,
    responseType: {} as Tag[],
  } as Endpoint<
    TagAssignPayload,
    Tag[],
    undefined,
    [string, TaggableEntity, string | number]
  >,

  // Unassign tags from an entity
  UNASSIGN_TAGS: {
    url: (
      org_slug: string,
      entityType: TaggableEntity,
      entityId: string | number
    ) => buildEntityTagUrl(org_slug, entityType, entityId),
    method: HTTP_METHODS.DELETE,
    requiresAuth: true,
    requestType: {} as { tags: number[] },
    responseType: {} as TagUnassignResponse,
  } as Endpoint<
    { tags: number[] },
    TagUnassignResponse,
    undefined,
    [string, TaggableEntity, string | number]
  >,
} as const;

// Helper types for the tags API
export type TagsApi = {
  getTags: (orgSlug: string) => Promise<PaginatedTags>;
  getTagBySlug: (orgSlug: string, slug: string) => Promise<Tag>;
  getEntityTags: (
    orgSlug: string,
    entityType: TaggableEntity,
    entityId: string | number
  ) => Promise<Tag[]>;
  createTag: (orgSlug: string, data: TagCreationPayload) => Promise<Tag>;
  updateTag: (
    orgSlug: string,
    tagId: string | number,
    data: Omit<TagUpdatePayload, 'id'>
  ) => Promise<Tag>;
  deleteTag: (
    orgSlug: string,
    tagId: string | number
  ) => Promise<{ success: boolean }>;
  assignTags: (
    orgSlug: string,
    entityType: TaggableEntity,
    entityId: string | number,
    tagIds: number[]
  ) => Promise<Tag[]>;
  unassignTags: (
    orgSlug: string,
    entityType: TaggableEntity,
    entityId: string | number,
    tagIds: number[]
  ) => Promise<TagUnassignResponse>;
};
