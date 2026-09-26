import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';
import { getAdminRoutes, getPublicRoutes } from './registry';

const routes: RouteObject[] = [
  ...getPublicRoutes(),
  {
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: getAdminRoutes(),
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/auth/login" replace /> },
];

export const router = createBrowserRouter(routes);
