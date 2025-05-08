import { HTTP_METHODS } from '../constants/constants';
import { Endpoint } from './index';
import {
  LoginPayload,
  LoginResponse,
  SignupPayload,
  SignupResponse,
  VerifyRegistrationResponse,
  ResendVerificationPayload,
  ResendVerificationResponse,
  PasswordResetRequestPayload,
  PasswordResetRequestResponse,
  PasswordResetConfirmPayload,
  PasswordResetConfirmResponse,
} from '../schemas/user';

export const authEndpoints = {
  SIGNUP: {
    url: '/auth/register',
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    requestType: {} as SignupPayload,
    responseType: {} as SignupResponse,
  } as Endpoint<SignupPayload, SignupResponse>,

  VERIFY_REGISTRATION: {
    url: '/auth/verify-registration',
    method: HTTP_METHODS.GET,
    requiresAuth: false,
    responseType: {} as VerifyRegistrationResponse,
  } as Endpoint<never, VerifyRegistrationResponse>,

  RESEND_VERIFICATION: {
    url: '/auth/resend-verification',
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    requestType: {} as ResendVerificationPayload,
    responseType: {} as ResendVerificationResponse,
  } as Endpoint<ResendVerificationPayload, ResendVerificationResponse>,

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
    url: '/refresh_token/',
    method: HTTP_METHODS.POST,
    requiresAuth: true,
  } as Endpoint<never, undefined>,

  PASSWORD_RESET_REQUEST: {
    url: '/auth/password-reset/request',
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    requestType: {} as PasswordResetRequestPayload,
    responseType: {} as PasswordResetRequestResponse,
  } as Endpoint<PasswordResetRequestPayload, PasswordResetRequestResponse>,

  PASSWORD_RESET_CONFIRM: {
    url: '/auth/password-reset/confirm',
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    requestType: {} as PasswordResetConfirmPayload,
    responseType: {} as PasswordResetConfirmResponse,
  } as Endpoint<PasswordResetConfirmPayload, PasswordResetConfirmResponse>,
};
