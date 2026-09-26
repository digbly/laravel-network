import { Suspense } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';
import { WebsiteRedirect } from '../components/admin/WebsiteRedirect';
import { PageLoader } from '../components/ui/PageLoader';
import { WebsitePickerView } from '../modules/network/lazy';
import { getAdminBasename } from '../utils/website';
import { getAdminRoutes, getPublicRoutes } from './registry';

/**
 * Module routes are declared as absolute paths (e.g. `/dashboard`). They live
 * under `websites/:websiteId`, so they are turned into relative children.
 */
const toWebsiteChild = (route: RouteObject): RouteObject => ({
  ...route,
  path: (route.path ?? '').replace(/^\//, ''),
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
        children: getAdminRoutes().map(toWebsiteChild),
      },
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
