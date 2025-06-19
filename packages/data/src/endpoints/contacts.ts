import { HTTP_METHODS } from '../constants/constants';
import { Endpoint } from './index';
import {
  Contact,
  PaginatedContacts,
  ContactsQueryParams,
} from '../schemas/contacts';
import { AvatarUrlResponse } from '../schemas/api';

export interface CreateContactPayload {
  display_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  organization?: string;
  notes?: string;
}

export interface UpdateContactPayload extends Partial<CreateContactPayload> {
  id: string;
}

export interface UpdateContactAvatarPayload {
  contactId: string;
  avatar: FormData;
}

export const contactsEndpoints = {
  // Get all contacts with pagination
  GET_CONTACTS: {
    url: '/contacts',
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as PaginatedContacts,
  } as Endpoint<ContactsQueryParams, PaginatedContacts>,

  // Get a single contact by slug
  GET_CONTACT: {
    url: (slug: string) => `/contacts/${slug}/`,
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as Contact,
  } as Endpoint<undefined, Contact, undefined, [string]>,

  // Create a new contact
  CREATE_CONTACT: {
    url: '/contacts',
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as CreateContactPayload,
    responseType: {} as Contact,
  } as Endpoint<CreateContactPayload, Contact>,

  // Update a contact
  UPDATE_CONTACT: {
    url: (slug: string) => `/contacts/${slug}`,
    method: HTTP_METHODS.PATCH,
    requiresAuth: true,
    requestType: {} as Omit<UpdateContactPayload, 'id'>,
    responseType: {} as Contact,
  } as Endpoint<Omit<UpdateContactPayload, 'id'>, Contact, undefined, [string]>,

  // Delete a contact
  DELETE_CONTACT: {
    url: (slug: string) => `/contacts/${slug}`,
    method: HTTP_METHODS.DELETE,
    requiresAuth: true,
    responseType: {} as { success: boolean },
  } as Endpoint<never, { success: boolean }, undefined, [string]>,

  // Upload contact avatar
  UPLOAD_AVATAR: {
    url: (contactSlug: string) => `/contacts/${contactSlug}/avatar`,
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as FormData,
    responseType: {} as Contact,
  } as Endpoint<FormData, Contact, undefined, [string]>,

  // Delete contact avatar
  DELETE_AVATAR: {
    url: (contactSlug: string) => `/contacts/${contactSlug}/avatar`,
    method: HTTP_METHODS.DELETE,
    requiresAuth: true,
    responseType: {} as Contact,
  } as Endpoint<never, Contact, undefined, [string]>,

  // Get contact avatar
  GET_AVATAR: {
    url: (avatarPath: string) => `/contacts/avatars/${avatarPath}`,
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as AvatarUrlResponse,
  } as Endpoint<never, AvatarUrlResponse, undefined, [string]>,
};

export const getContactAvatarUrl = (avatarPath: string) =>
  contactsEndpoints.GET_AVATAR.url(avatarPath);
