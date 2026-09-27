import { Suspense } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RequirePermission } from '../components/auth/RequirePermission';
import { RequireSuperAdmin } from '../components/admin/RequireSuperAdmin';
import { AdminLayout } from '../components/layout/AdminLayout';
import { WebsiteRedirect } from '../components/admin/WebsiteRedirect';
import { PageLoader } from '../components/ui/PageLoader';
import { NetworkLayout } from '../modules/network/layout/NetworkLayout';
import {
  NetworkDashboardView,
  NetworkUserFormView,
  NetworkUsersView,
  NetworkWebsitesView,
  WebsitePickerView,
} from '../modules/network/lazy';
import { MediaLibraryView } from './media/lazy';
import { getAdminBasename } from '../utils/website';
import { getAdminRoutes, getPublicRoutes, getStandaloneAdminRoutes } from './registry';

/**
 * Module routes are declared as absolute paths (e.g. `/dashboard`). They live
 * under `websites/:websiteId`, so they are turned into relative children.
 */
const toWebsiteChild = (route: RouteObject): RouteObject => ({
  ...route,
  path: (route.path ?? '').replace(/^\//, ''),
});

/**
 * Standalone routes render under `/websites/:websiteId` outside the admin
 * shell. They are siblings of the shell route so they can own the full screen.
 */
const toStandaloneRoute = (route: RouteObject): RouteObject => ({
  path: `:websiteId/${(route.path ?? '').replace(/^\//, '')}`,
  handle: route.handle,
  element: (
    <ProtectedRoute>
      <RequirePermission>
        <Suspense fallback={<PageLoader />}>{route.element}</Suspense>
      </RequirePermission>
    </ProtectedRoute>
  ),
});

const routes: RouteObject[] = [
  ...getPublicRoutes(),
  {
    path: 'websites',
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <WebsitePickerView />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: ':websiteId',
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          ...getAdminRoutes().map(toWebsiteChild),
          {
            path: 'media',
            element: <MediaLibraryView />,
            handle: { permission: 'media.view' },
          },
        ],
      },
      ...getStandaloneAdminRoutes().map(toStandaloneRoute),
    ],
  },
  {
    path: 'network',
    element: (
      <ProtectedRoute>
        <RequireSuperAdmin>
          <NetworkLayout />
        </RequireSuperAdmin>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <NetworkDashboardView /> },
      { path: 'websites', element: <NetworkWebsitesView /> },
      { path: 'users', element: <NetworkUsersView /> },
      { path: 'users/new', element: <NetworkUserFormView /> },
      { path: 'users/:userId/edit', element: <NetworkUserFormView /> },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <WebsiteRedirect />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <Navigate to="/auth/login" replace /> },
];

export const router = createBrowserRouter(routes, {
  basename: getAdminBasename(),
});
