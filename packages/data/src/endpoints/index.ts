import { HTTP_METHODS } from '../constants/constants';

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export type Endpoint<
  TRequest = undefined,
  TResponse = unknown,
  TQuery = undefined,
> = {
  url: string;
  method: HttpMethod;
  requiresAuth?: boolean;
  requestType?: TRequest;
  responseType?: TResponse;
  queryType?: TQuery;
};

export type EndpointDefinitions<
  T extends {
    [Category in string]: {
      [Route in string]: Endpoint<unknown, unknown, unknown>;
    };
  },
> = {
  [Category in keyof T]: {
    [Route in keyof T[Category]]: T[Category][Route] extends Endpoint<
      infer Req,
      infer Res,
      infer Query
    >
      ? Endpoint<Req, Res, Query>
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

export const API_ENDPOINTS = {
  AUTH: authEndpoints,
  USER: userEndpoints,
} as const;

export type ApiEndpointPath = PathsToStringLiteral<
  NestedPaths<typeof API_ENDPOINTS>
>;
