import { HTTP_METHODS } from '../constants/constants';
import { Endpoint } from './index';
import { User, ProfilePayload } from '../schemas/user';
import { AvatarUrlResponse } from '../schemas/api';

// Define any user-specific payload types here or import from schemas
export interface CheckUsernamePayload {
  username: string;
}

export interface CheckUsernameResponse {
  available: boolean;
}

export interface UpdateUsernamePayload {
  username: string;
}

export interface ChangeAvatarPayload {
  avatar: FormData;
}

export const userEndpoints = {
  GET_PROFILE_FOR_USER: {
    url: '/users/me',
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as User,
  } as Endpoint<undefined, User>,

  CHECK_USERNAME: {
    url: '/users/check_username',
    method: HTTP_METHODS.GET,
    requiresAuth: false,
    requestType: {} as CheckUsernamePayload,
    responseType: {} as CheckUsernameResponse,
  } as Endpoint<CheckUsernamePayload, CheckUsernameResponse>,

  UPDATE_USERNAME: {
    url: '/users/username',
    method: HTTP_METHODS.PATCH,
    requiresAuth: true,
    requestType: {} as UpdateUsernamePayload,
    responseType: {} as User,
  } as Endpoint<UpdateUsernamePayload, User>,

  UPDATE_PROFILE: {
    url: '/users/me',
    method: HTTP_METHODS.PATCH,
    requiresAuth: true,
    requestType: {} as ProfilePayload,
    responseType: {} as User,
  } as Endpoint<ProfilePayload, User>,

  CHANGE_AVATAR: {
    url: '/users/avatar',
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    requestType: {} as ChangeAvatarPayload,
    responseType: {} as User,
  } as Endpoint<ChangeAvatarPayload, User>,

  DELETE_AVATAR: {
    url: '/users/avatar',
    method: HTTP_METHODS.DELETE,
    requiresAuth: true,
    responseType: {} as User,
  } as Endpoint<never, User>,

  // Get user avatar
  GET_AVATAR: {
    url: (avatarPath: string) => `/users/avatars/${avatarPath}`,
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as AvatarUrlResponse,
  } as Endpoint<never, AvatarUrlResponse, undefined, [string]>,
};
export const getUserAvatarUrl = (avatarPath: string) =>
  userEndpoints.GET_AVATAR.url(avatarPath);
