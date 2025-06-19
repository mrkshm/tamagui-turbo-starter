export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export enum AvatarEntityType {
  User = 'user',
  Contact = 'contact',
}

export type AvatarEntityTypeLiteral = `${AvatarEntityType}`;
