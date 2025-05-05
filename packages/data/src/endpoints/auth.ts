import { HTTP_METHODS } from '../constants/constants';
import { Endpoint } from './index';
import {
  LoginPayload,
  LoginResponse,
  SignupPayload,
  SignupResponse,
} from '../schemas/user';

export const authEndpoints = {
  SIGNUP: {
    url: '/auth/register',
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    requestType: {} as SignupPayload,
    responseType: {} as SignupResponse,
  },
  LOGIN: {
    url: '/token/pair',
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    requestType: {} as LoginPayload,
    responseType: {} as LoginResponse,
  } as Endpoint<LoginPayload, LoginResponse>,

  LOGOUT: {
    url: '/auth/logout/',
    method: HTTP_METHODS.POST,
    requiresAuth: true,
  } as Endpoint<never, undefined>,

  REFRESH_TOKEN: {
    url: '/refresh_token',
    method: HTTP_METHODS.POST,
    requiresAuth: true,
  } as Endpoint<never, undefined>,
};
