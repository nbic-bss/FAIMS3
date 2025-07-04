/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as ProtectedImport } from './routes/_protected'
import { Route as ProtectedIndexImport } from './routes/_protected/index'
import { Route as ProtectedAdminImport } from './routes/_protected/_admin'
import { Route as ProtectedTemplatesIndexImport } from './routes/_protected/templates/index'
import { Route as ProtectedTeamsIndexImport } from './routes/_protected/teams/index'
import { Route as ProtectedProjectsIndexImport } from './routes/_protected/projects/index'
import { Route as ProtectedProfileIndexImport } from './routes/_protected/profile/index'
import { Route as ProtectedTemplatesTemplateIdImport } from './routes/_protected/templates/$templateId'
import { Route as ProtectedTeamsTeamIdImport } from './routes/_protected/teams/$teamId'
import { Route as ProtectedProjectsProjectIdImport } from './routes/_protected/projects/$projectId'
import { Route as ProtectedProfileLongLivedTokensImport } from './routes/_protected/profile/long-lived-tokens'
import { Route as ProtectedAdminUsersImport } from './routes/_protected/_admin/users'

// Create/Update Routes

const ProtectedRoute = ProtectedImport.update({
  id: '/_protected',
  getParentRoute: () => rootRoute,
} as any)

const ProtectedIndexRoute = ProtectedIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedAdminRoute = ProtectedAdminImport.update({
  id: '/_admin',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedTemplatesIndexRoute = ProtectedTemplatesIndexImport.update({
  id: '/templates/',
  path: '/templates/',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedTeamsIndexRoute = ProtectedTeamsIndexImport.update({
  id: '/teams/',
  path: '/teams/',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedProjectsIndexRoute = ProtectedProjectsIndexImport.update({
  id: '/projects/',
  path: '/projects/',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedProfileIndexRoute = ProtectedProfileIndexImport.update({
  id: '/profile/',
  path: '/profile/',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedTemplatesTemplateIdRoute =
  ProtectedTemplatesTemplateIdImport.update({
    id: '/templates/$templateId',
    path: '/templates/$templateId',
    getParentRoute: () => ProtectedRoute,
  } as any)

const ProtectedTeamsTeamIdRoute = ProtectedTeamsTeamIdImport.update({
  id: '/teams/$teamId',
  path: '/teams/$teamId',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedProjectsProjectIdRoute = ProtectedProjectsProjectIdImport.update(
  {
    id: '/projects/$projectId',
    path: '/projects/$projectId',
    getParentRoute: () => ProtectedRoute,
  } as any,
)

const ProtectedProfileLongLivedTokensRoute =
  ProtectedProfileLongLivedTokensImport.update({
    id: '/profile/long-lived-tokens',
    path: '/profile/long-lived-tokens',
    getParentRoute: () => ProtectedRoute,
  } as any)

const ProtectedAdminUsersRoute = ProtectedAdminUsersImport.update({
  id: '/users',
  path: '/users',
  getParentRoute: () => ProtectedAdminRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_protected': {
      id: '/_protected'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof ProtectedImport
      parentRoute: typeof rootRoute
    }
    '/_protected/_admin': {
      id: '/_protected/_admin'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof ProtectedAdminImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/': {
      id: '/_protected/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof ProtectedIndexImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/_admin/users': {
      id: '/_protected/_admin/users'
      path: '/users'
      fullPath: '/users'
      preLoaderRoute: typeof ProtectedAdminUsersImport
      parentRoute: typeof ProtectedAdminImport
    }
    '/_protected/profile/long-lived-tokens': {
      id: '/_protected/profile/long-lived-tokens'
      path: '/profile/long-lived-tokens'
      fullPath: '/profile/long-lived-tokens'
      preLoaderRoute: typeof ProtectedProfileLongLivedTokensImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/projects/$projectId': {
      id: '/_protected/projects/$projectId'
      path: '/projects/$projectId'
      fullPath: '/projects/$projectId'
      preLoaderRoute: typeof ProtectedProjectsProjectIdImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/teams/$teamId': {
      id: '/_protected/teams/$teamId'
      path: '/teams/$teamId'
      fullPath: '/teams/$teamId'
      preLoaderRoute: typeof ProtectedTeamsTeamIdImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/templates/$templateId': {
      id: '/_protected/templates/$templateId'
      path: '/templates/$templateId'
      fullPath: '/templates/$templateId'
      preLoaderRoute: typeof ProtectedTemplatesTemplateIdImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/profile/': {
      id: '/_protected/profile/'
      path: '/profile'
      fullPath: '/profile'
      preLoaderRoute: typeof ProtectedProfileIndexImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/projects/': {
      id: '/_protected/projects/'
      path: '/projects'
      fullPath: '/projects'
      preLoaderRoute: typeof ProtectedProjectsIndexImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/teams/': {
      id: '/_protected/teams/'
      path: '/teams'
      fullPath: '/teams'
      preLoaderRoute: typeof ProtectedTeamsIndexImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/templates/': {
      id: '/_protected/templates/'
      path: '/templates'
      fullPath: '/templates'
      preLoaderRoute: typeof ProtectedTemplatesIndexImport
      parentRoute: typeof ProtectedImport
    }
  }
}

// Create and export the route tree

interface ProtectedAdminRouteChildren {
  ProtectedAdminUsersRoute: typeof ProtectedAdminUsersRoute
}

const ProtectedAdminRouteChildren: ProtectedAdminRouteChildren = {
  ProtectedAdminUsersRoute: ProtectedAdminUsersRoute,
}

const ProtectedAdminRouteWithChildren = ProtectedAdminRoute._addFileChildren(
  ProtectedAdminRouteChildren,
)

interface ProtectedRouteChildren {
  ProtectedAdminRoute: typeof ProtectedAdminRouteWithChildren
  ProtectedIndexRoute: typeof ProtectedIndexRoute
  ProtectedProfileLongLivedTokensRoute: typeof ProtectedProfileLongLivedTokensRoute
  ProtectedProjectsProjectIdRoute: typeof ProtectedProjectsProjectIdRoute
  ProtectedTeamsTeamIdRoute: typeof ProtectedTeamsTeamIdRoute
  ProtectedTemplatesTemplateIdRoute: typeof ProtectedTemplatesTemplateIdRoute
  ProtectedProfileIndexRoute: typeof ProtectedProfileIndexRoute
  ProtectedProjectsIndexRoute: typeof ProtectedProjectsIndexRoute
  ProtectedTeamsIndexRoute: typeof ProtectedTeamsIndexRoute
  ProtectedTemplatesIndexRoute: typeof ProtectedTemplatesIndexRoute
}

const ProtectedRouteChildren: ProtectedRouteChildren = {
  ProtectedAdminRoute: ProtectedAdminRouteWithChildren,
  ProtectedIndexRoute: ProtectedIndexRoute,
  ProtectedProfileLongLivedTokensRoute: ProtectedProfileLongLivedTokensRoute,
  ProtectedProjectsProjectIdRoute: ProtectedProjectsProjectIdRoute,
  ProtectedTeamsTeamIdRoute: ProtectedTeamsTeamIdRoute,
  ProtectedTemplatesTemplateIdRoute: ProtectedTemplatesTemplateIdRoute,
  ProtectedProfileIndexRoute: ProtectedProfileIndexRoute,
  ProtectedProjectsIndexRoute: ProtectedProjectsIndexRoute,
  ProtectedTeamsIndexRoute: ProtectedTeamsIndexRoute,
  ProtectedTemplatesIndexRoute: ProtectedTemplatesIndexRoute,
}

const ProtectedRouteWithChildren = ProtectedRoute._addFileChildren(
  ProtectedRouteChildren,
)

export interface FileRoutesByFullPath {
  '': typeof ProtectedAdminRouteWithChildren
  '/': typeof ProtectedIndexRoute
  '/users': typeof ProtectedAdminUsersRoute
  '/profile/long-lived-tokens': typeof ProtectedProfileLongLivedTokensRoute
  '/projects/$projectId': typeof ProtectedProjectsProjectIdRoute
  '/teams/$teamId': typeof ProtectedTeamsTeamIdRoute
  '/templates/$templateId': typeof ProtectedTemplatesTemplateIdRoute
  '/profile': typeof ProtectedProfileIndexRoute
  '/projects': typeof ProtectedProjectsIndexRoute
  '/teams': typeof ProtectedTeamsIndexRoute
  '/templates': typeof ProtectedTemplatesIndexRoute
}

export interface FileRoutesByTo {
  '': typeof ProtectedAdminRouteWithChildren
  '/': typeof ProtectedIndexRoute
  '/users': typeof ProtectedAdminUsersRoute
  '/profile/long-lived-tokens': typeof ProtectedProfileLongLivedTokensRoute
  '/projects/$projectId': typeof ProtectedProjectsProjectIdRoute
  '/teams/$teamId': typeof ProtectedTeamsTeamIdRoute
  '/templates/$templateId': typeof ProtectedTemplatesTemplateIdRoute
  '/profile': typeof ProtectedProfileIndexRoute
  '/projects': typeof ProtectedProjectsIndexRoute
  '/teams': typeof ProtectedTeamsIndexRoute
  '/templates': typeof ProtectedTemplatesIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_protected': typeof ProtectedRouteWithChildren
  '/_protected/_admin': typeof ProtectedAdminRouteWithChildren
  '/_protected/': typeof ProtectedIndexRoute
  '/_protected/_admin/users': typeof ProtectedAdminUsersRoute
  '/_protected/profile/long-lived-tokens': typeof ProtectedProfileLongLivedTokensRoute
  '/_protected/projects/$projectId': typeof ProtectedProjectsProjectIdRoute
  '/_protected/teams/$teamId': typeof ProtectedTeamsTeamIdRoute
  '/_protected/templates/$templateId': typeof ProtectedTemplatesTemplateIdRoute
  '/_protected/profile/': typeof ProtectedProfileIndexRoute
  '/_protected/projects/': typeof ProtectedProjectsIndexRoute
  '/_protected/teams/': typeof ProtectedTeamsIndexRoute
  '/_protected/templates/': typeof ProtectedTemplatesIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/'
    | '/users'
    | '/profile/long-lived-tokens'
    | '/projects/$projectId'
    | '/teams/$teamId'
    | '/templates/$templateId'
    | '/profile'
    | '/projects'
    | '/teams'
    | '/templates'
  fileRoutesByTo: FileRoutesByTo
  to:
    | ''
    | '/'
    | '/users'
    | '/profile/long-lived-tokens'
    | '/projects/$projectId'
    | '/teams/$teamId'
    | '/templates/$templateId'
    | '/profile'
    | '/projects'
    | '/teams'
    | '/templates'
  id:
    | '__root__'
    | '/_protected'
    | '/_protected/_admin'
    | '/_protected/'
    | '/_protected/_admin/users'
    | '/_protected/profile/long-lived-tokens'
    | '/_protected/projects/$projectId'
    | '/_protected/teams/$teamId'
    | '/_protected/templates/$templateId'
    | '/_protected/profile/'
    | '/_protected/projects/'
    | '/_protected/teams/'
    | '/_protected/templates/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  ProtectedRoute: typeof ProtectedRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  ProtectedRoute: ProtectedRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_protected"
      ]
    },
    "/_protected": {
      "filePath": "_protected.tsx",
      "children": [
        "/_protected/_admin",
        "/_protected/",
        "/_protected/profile/long-lived-tokens",
        "/_protected/projects/$projectId",
        "/_protected/teams/$teamId",
        "/_protected/templates/$templateId",
        "/_protected/profile/",
        "/_protected/projects/",
        "/_protected/teams/",
        "/_protected/templates/"
      ]
    },
    "/_protected/_admin": {
      "filePath": "_protected/_admin.tsx",
      "parent": "/_protected",
      "children": [
        "/_protected/_admin/users"
      ]
    },
    "/_protected/": {
      "filePath": "_protected/index.tsx",
      "parent": "/_protected"
    },
    "/_protected/_admin/users": {
      "filePath": "_protected/_admin/users.tsx",
      "parent": "/_protected/_admin"
    },
    "/_protected/profile/long-lived-tokens": {
      "filePath": "_protected/profile/long-lived-tokens.tsx",
      "parent": "/_protected"
    },
    "/_protected/projects/$projectId": {
      "filePath": "_protected/projects/$projectId.tsx",
      "parent": "/_protected"
    },
    "/_protected/teams/$teamId": {
      "filePath": "_protected/teams/$teamId.tsx",
      "parent": "/_protected"
    },
    "/_protected/templates/$templateId": {
      "filePath": "_protected/templates/$templateId.tsx",
      "parent": "/_protected"
    },
    "/_protected/profile/": {
      "filePath": "_protected/profile/index.tsx",
      "parent": "/_protected"
    },
    "/_protected/projects/": {
      "filePath": "_protected/projects/index.tsx",
      "parent": "/_protected"
    },
    "/_protected/teams/": {
      "filePath": "_protected/teams/index.tsx",
      "parent": "/_protected"
    },
    "/_protected/templates/": {
      "filePath": "_protected/templates/index.tsx",
      "parent": "/_protected"
    }
  }
}
ROUTE_MANIFEST_END */
