import { HTTP_METHODS } from '../constants/constants';
import { Endpoint } from './index';
import { User } from '../schemas/user';

// Define any user-specific payload types here or import from schemas
export interface CheckUsernamePayload {
  username: string;
}

export interface CheckUsernameResponse {
  available: boolean;
}

export interface ChangeLanguagePayload {
  locale: string;
}

export interface ChangeThemePayload {
  theme: string;
}

export interface ProfilePayload {
  name?: string;
  bio?: string;
  email?: string;
  // Add other profile fields as needed
}

export interface ChangeAvatarPayload {
  avatar: FormData; // For file uploads
}

export const userEndpoints = {
  GET_PROFILE_FOR_USER: {
    url: '/users/me',
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as User,
  } as Endpoint<undefined, User>,

  CHECK_USERNAME: {
    url: '/usernames/verify',
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as CheckUsernamePayload,
    responseType: {} as CheckUsernameResponse,
  } as Endpoint<CheckUsernamePayload, CheckUsernameResponse>,

  CHANGE_LANGUAGE: {
    url: '/profile/locale',
    method: HTTP_METHODS.PATCH,
    requiresAuth: true,
    requestType: {} as ChangeLanguagePayload,
    responseType: {} as User,
  } as Endpoint<ChangeLanguagePayload, User>,

  CHANGE_THEME: {
    url: '/profile/theme',
    method: HTTP_METHODS.PATCH,
    requiresAuth: true,
    requestType: {} as ChangeThemePayload,
    responseType: {} as User,
  } as Endpoint<ChangeThemePayload, User>,

  UPDATE_PROFILE: {
    url: '/profile',
    method: HTTP_METHODS.PATCH,
    requiresAuth: true,
    requestType: {} as ProfilePayload,
    responseType: {} as User,
  } as Endpoint<ProfilePayload, User>,

  CHANGE_AVATAR: {
    url: '/profile/avatar',
    method: HTTP_METHODS.PATCH,
    requiresAuth: true,
    requestType: {} as ChangeAvatarPayload,
    responseType: {} as User,
  } as Endpoint<ChangeAvatarPayload, User>,

  DELETE_AVATAR: {
    url: '/profile/avatar',
    method: HTTP_METHODS.DELETE,
    requiresAuth: true,
    responseType: {} as User,
  } as Endpoint<never, User>,
};
