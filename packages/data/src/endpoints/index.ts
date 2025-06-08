import { HTTP_METHODS } from '../constants/constants';

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

type UrlType<TParams extends any[] = []> = TParams extends []
  ? string
  : (...args: TParams) => string;

export type Endpoint<
  TRequest = undefined,
  TResponse = unknown,
  TQuery = undefined,
  TUrlParams extends any[] = [],
> = {
  url: UrlType<TUrlParams>;
  method: HttpMethod;
  requiresAuth?: boolean;
  requestType?: TRequest;
  responseType?: TResponse;
  queryType?: TQuery;
};

export type EndpointDefinitions<
  T extends {
    [Category in string]: {
      [Route in string]: Endpoint<unknown, unknown, unknown, any[]>;
    };
  },
> = {
  [Category in keyof T]: {
    [Route in keyof T[Category]]: T[Category][Route] extends Endpoint<
      infer Req,
      infer Res,
      infer Query,
      infer UrlParams
    >
      ? Endpoint<Req, Res, Query, UrlParams>
      : never;
  };
};

/**
 * Recursively extracts all possible nested paths from an endpoint definition
 * Returns an array of path segments that can be used to access nested properties
 */
type NestedPaths<T> = T extends Endpoint
  ? []
  : T extends object
    ? {
        [K in keyof T]: [...[K], ...NestedPaths<T[K]>];
      }[keyof T]
    : never;

/**
 * Converts an array of path segments into a dot-notation string literal type
 * Example: ['AUTH', 'LOGIN'] becomes 'AUTH.LOGIN'
 */
type PathsToStringLiteral<T extends readonly any[]> = T extends []
  ? never
  : T extends [infer First]
    ? `${string & First}`
    : T extends [infer First, ...infer Rest]
      ? `${string & First}.${PathsToStringLiteral<Rest>}`
      : string;

import { userEndpoints } from './user';
import { authEndpoints } from './auth';
import { contactsEndpoints } from './contacts';

export const API_ENDPOINTS = {
  AUTH: authEndpoints,
  USER: userEndpoints,
  CONTACTS: contactsEndpoints,
} as const;

export type ApiEndpointPath = PathsToStringLiteral<
  NestedPaths<typeof API_ENDPOINTS>
>;
