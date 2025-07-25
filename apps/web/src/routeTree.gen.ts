/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as MemberIndexRouteImport } from './routes/member/index'
import { Route as LandingIndexRouteImport } from './routes/landing/index'
import { Route as AuthWaitingRouteImport } from './routes/auth/waiting'
import { Route as AuthVerifyRouteImport } from './routes/auth/verify'
import { Route as AuthSignupRouteImport } from './routes/auth/signup'
import { Route as AuthPasswordResetConfirmRouteImport } from './routes/auth/password-reset-confirm'
import { Route as AuthPasswordResetRouteImport } from './routes/auth/password-reset'
import { Route as AuthLoginRouteImport } from './routes/auth/login'
import { Route as MemberProfileIndexRouteImport } from './routes/member/profile/index'
import { Route as MemberContactsIndexRouteImport } from './routes/member/contacts/index'
import { Route as MemberContactsContactSlugRouteImport } from './routes/member/contacts/$contactSlug'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const MemberIndexRoute = MemberIndexRouteImport.update({
  id: '/member/',
  path: '/member/',
  getParentRoute: () => rootRouteImport,
} as any)
const LandingIndexRoute = LandingIndexRouteImport.update({
  id: '/landing/',
  path: '/landing/',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthWaitingRoute = AuthWaitingRouteImport.update({
  id: '/auth/waiting',
  path: '/auth/waiting',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthVerifyRoute = AuthVerifyRouteImport.update({
  id: '/auth/verify',
  path: '/auth/verify',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthSignupRoute = AuthSignupRouteImport.update({
  id: '/auth/signup',
  path: '/auth/signup',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthPasswordResetConfirmRoute =
  AuthPasswordResetConfirmRouteImport.update({
    id: '/auth/password-reset-confirm',
    path: '/auth/password-reset-confirm',
    getParentRoute: () => rootRouteImport,
  } as any)
const AuthPasswordResetRoute = AuthPasswordResetRouteImport.update({
  id: '/auth/password-reset',
  path: '/auth/password-reset',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthLoginRoute = AuthLoginRouteImport.update({
  id: '/auth/login',
  path: '/auth/login',
  getParentRoute: () => rootRouteImport,
} as any)
const MemberProfileIndexRoute = MemberProfileIndexRouteImport.update({
  id: '/member/profile/',
  path: '/member/profile/',
  getParentRoute: () => rootRouteImport,
} as any)
const MemberContactsIndexRoute = MemberContactsIndexRouteImport.update({
  id: '/member/contacts/',
  path: '/member/contacts/',
  getParentRoute: () => rootRouteImport,
} as any)
const MemberContactsContactSlugRoute =
  MemberContactsContactSlugRouteImport.update({
    id: '/member/contacts/$contactSlug',
    path: '/member/contacts/$contactSlug',
    getParentRoute: () => rootRouteImport,
  } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/password-reset': typeof AuthPasswordResetRoute
  '/auth/password-reset-confirm': typeof AuthPasswordResetConfirmRoute
  '/auth/signup': typeof AuthSignupRoute
  '/auth/verify': typeof AuthVerifyRoute
  '/auth/waiting': typeof AuthWaitingRoute
  '/landing': typeof LandingIndexRoute
  '/member': typeof MemberIndexRoute
  '/member/contacts/$contactSlug': typeof MemberContactsContactSlugRoute
  '/member/contacts': typeof MemberContactsIndexRoute
  '/member/profile': typeof MemberProfileIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/password-reset': typeof AuthPasswordResetRoute
  '/auth/password-reset-confirm': typeof AuthPasswordResetConfirmRoute
  '/auth/signup': typeof AuthSignupRoute
  '/auth/verify': typeof AuthVerifyRoute
  '/auth/waiting': typeof AuthWaitingRoute
  '/landing': typeof LandingIndexRoute
  '/member': typeof MemberIndexRoute
  '/member/contacts/$contactSlug': typeof MemberContactsContactSlugRoute
  '/member/contacts': typeof MemberContactsIndexRoute
  '/member/profile': typeof MemberProfileIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/password-reset': typeof AuthPasswordResetRoute
  '/auth/password-reset-confirm': typeof AuthPasswordResetConfirmRoute
  '/auth/signup': typeof AuthSignupRoute
  '/auth/verify': typeof AuthVerifyRoute
  '/auth/waiting': typeof AuthWaitingRoute
  '/landing/': typeof LandingIndexRoute
  '/member/': typeof MemberIndexRoute
  '/member/contacts/$contactSlug': typeof MemberContactsContactSlugRoute
  '/member/contacts/': typeof MemberContactsIndexRoute
  '/member/profile/': typeof MemberProfileIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/auth/login'
    | '/auth/password-reset'
    | '/auth/password-reset-confirm'
    | '/auth/signup'
    | '/auth/verify'
    | '/auth/waiting'
    | '/landing'
    | '/member'
    | '/member/contacts/$contactSlug'
    | '/member/contacts'
    | '/member/profile'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/auth/login'
    | '/auth/password-reset'
    | '/auth/password-reset-confirm'
    | '/auth/signup'
    | '/auth/verify'
    | '/auth/waiting'
    | '/landing'
    | '/member'
    | '/member/contacts/$contactSlug'
    | '/member/contacts'
    | '/member/profile'
  id:
    | '__root__'
    | '/'
    | '/auth/login'
    | '/auth/password-reset'
    | '/auth/password-reset-confirm'
    | '/auth/signup'
    | '/auth/verify'
    | '/auth/waiting'
    | '/landing/'
    | '/member/'
    | '/member/contacts/$contactSlug'
    | '/member/contacts/'
    | '/member/profile/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthLoginRoute: typeof AuthLoginRoute
  AuthPasswordResetRoute: typeof AuthPasswordResetRoute
  AuthPasswordResetConfirmRoute: typeof AuthPasswordResetConfirmRoute
  AuthSignupRoute: typeof AuthSignupRoute
  AuthVerifyRoute: typeof AuthVerifyRoute
  AuthWaitingRoute: typeof AuthWaitingRoute
  LandingIndexRoute: typeof LandingIndexRoute
  MemberIndexRoute: typeof MemberIndexRoute
  MemberContactsContactSlugRoute: typeof MemberContactsContactSlugRoute
  MemberContactsIndexRoute: typeof MemberContactsIndexRoute
  MemberProfileIndexRoute: typeof MemberProfileIndexRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/member/': {
      id: '/member/'
      path: '/member'
      fullPath: '/member'
      preLoaderRoute: typeof MemberIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/landing/': {
      id: '/landing/'
      path: '/landing'
      fullPath: '/landing'
      preLoaderRoute: typeof LandingIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/auth/waiting': {
      id: '/auth/waiting'
      path: '/auth/waiting'
      fullPath: '/auth/waiting'
      preLoaderRoute: typeof AuthWaitingRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/auth/verify': {
      id: '/auth/verify'
      path: '/auth/verify'
      fullPath: '/auth/verify'
      preLoaderRoute: typeof AuthVerifyRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/auth/signup': {
      id: '/auth/signup'
      path: '/auth/signup'
      fullPath: '/auth/signup'
      preLoaderRoute: typeof AuthSignupRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/auth/password-reset-confirm': {
      id: '/auth/password-reset-confirm'
      path: '/auth/password-reset-confirm'
      fullPath: '/auth/password-reset-confirm'
      preLoaderRoute: typeof AuthPasswordResetConfirmRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/auth/password-reset': {
      id: '/auth/password-reset'
      path: '/auth/password-reset'
      fullPath: '/auth/password-reset'
      preLoaderRoute: typeof AuthPasswordResetRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/auth/login': {
      id: '/auth/login'
      path: '/auth/login'
      fullPath: '/auth/login'
      preLoaderRoute: typeof AuthLoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/member/profile/': {
      id: '/member/profile/'
      path: '/member/profile'
      fullPath: '/member/profile'
      preLoaderRoute: typeof MemberProfileIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/member/contacts/': {
      id: '/member/contacts/'
      path: '/member/contacts'
      fullPath: '/member/contacts'
      preLoaderRoute: typeof MemberContactsIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/member/contacts/$contactSlug': {
      id: '/member/contacts/$contactSlug'
      path: '/member/contacts/$contactSlug'
      fullPath: '/member/contacts/$contactSlug'
      preLoaderRoute: typeof MemberContactsContactSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthLoginRoute: AuthLoginRoute,
  AuthPasswordResetRoute: AuthPasswordResetRoute,
  AuthPasswordResetConfirmRoute: AuthPasswordResetConfirmRoute,
  AuthSignupRoute: AuthSignupRoute,
  AuthVerifyRoute: AuthVerifyRoute,
  AuthWaitingRoute: AuthWaitingRoute,
  LandingIndexRoute: LandingIndexRoute,
  MemberIndexRoute: MemberIndexRoute,
  MemberContactsContactSlugRoute: MemberContactsContactSlugRoute,
  MemberContactsIndexRoute: MemberContactsIndexRoute,
  MemberProfileIndexRoute: MemberProfileIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
